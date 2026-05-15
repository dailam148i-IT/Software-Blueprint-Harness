import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runCli } from "../blueprint/core/cli.js";
import { parseSimpleYaml } from "../blueprint/core/simple-yaml.js";

async function withTempProject(fn) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "blueprint-test-"));
  try {
    await fn(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    process.exitCode = 0;
  }
}

async function capture(fn) {
  const logs = [];
  const oldLog = console.log;
  console.log = (...args) => logs.push(args.join(" "));
  try {
    await fn();
  } finally {
    console.log = oldLog;
  }
  return logs.join("\n");
}

test("init creates harness and GitHub templates", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes", "--with-github", "--with-examples"]);
    assert.equal(await exists(path.join(root, "AGENTS.md")), true);
    assert.equal(await exists(path.join(root, "docs/product/product-passport.yaml")), true);
    assert.equal(await exists(path.join(root, ".github/workflows/blueprint-check.yml")), true);
    assert.equal(await exists(path.join(root, "examples/demo-student-management/README.md")), true);
    assert.equal(await exists(path.join(root, "extensions/security-threat-model/extension.yaml")), true);
    const extensionManifest = await fs.readFile(path.join(root, "extensions/security-threat-model/extension.yaml"), "utf8");
    const gitignore = await fs.readFile(path.join(root, ".gitignore"), "utf8");
    const workflow = await fs.readFile(path.join(root, ".github/workflows/blueprint-check.yml"), "utf8");
    assert.match(extensionManifest, /type: quality-gate-extension/);
    assert.match(gitignore, /refs\/vendor\//);
    assert.doesNotMatch(workflow, /--strict/);
  });
});

test("version and doctor ci expose release health", async () => {
  await withTempProject(async (root) => {
    const version = await capture(() => runCli(["--version"]));
    assert.match(version, /\d+\.\d+\.\d+/);

    const missing = path.join(root, "missing-target");
    await capture(() => runCli(["doctor", "--directory", missing, "--ci"]));
    assert.equal(process.exitCode, 1);
    process.exitCode = 0;
  });
});

test("check validates installed structure", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    const output = await capture(() => runCli(["check", "--directory", root]));
    assert.match(output, /PASS_WITH_CONCERNS/);
    assert.match(output, /No story packets yet/i);
  });
});

test("story and context packet generation work", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await runCli(["new-story", "Create student profile", "--directory", root]);
    await runCli(["export-context", "US-001", "--agent", "developer-agent", "--directory", root]);
    assert.equal(await exists(path.join(root, "docs/stories/US-001-create-student-profile.md")), true);
    assert.equal(await exists(path.join(root, ".blueprint/context-packets/US-001-developer-agent.md")), true);
  });
});

test("extension hook runner creates declared artifacts", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await runCli(["extension", "create", "security-threat-model", "--directory", root]);
    await runCli(["extension", "run", "before_readiness", "--directory", root]);
    assert.equal(await exists(path.join(root, "extensions/security-threat-model/extension.yaml")), true);
    assert.equal(await exists(path.join(root, "docs/security/threat-model.md")), true);
  });
});

test("memory update and compact create memory outputs", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await runCli(["memory", "update", "--directory", root]);
    await runCli(["memory", "compact", "--directory", root]);
    const memoryText = await fs.readFile(path.join(root, ".blueprint/memory/project-memory.yaml"), "utf8");
    const memory = parseSimpleYaml(memoryText);
    assert.equal(memoryText.includes("[object Object]"), false);
    assert.equal(Array.isArray(memory.artifacts), true);
    assert.equal(typeof memory.artifacts[0].path, "string");
    assert.equal(await exists(path.join(root, ".blueprint/memory/compact-context.md")), true);
  });
});

test("readiness blocks placeholder documentation", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await runCli(["new-story", "Create student profile", "--directory", root]);
    const output = await capture(() => runCli(["readiness", "--directory", root]));
    assert.match(output, /FAIL/);
    const readiness = await fs.readFile(path.join(root, "docs/readiness-review.md"), "utf8");
    assert.match(readiness, /placeholder/i);
    assert.match(readiness, /Product Passport field is not implementation-ready/i);
  });
});

test("readiness requires extension outputs for high-risk context", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await fs.writeFile(
      path.join(root, "docs/product/product-passport.yaml"),
      `product_name: Student Management System
product_type: web_admin_app
target_users:
  - admin
problem: Manage student personal data with role-based access.
desired_outcome: Admins can manage student records safely.
in_scope:
  - authentication
  - student personal data
out_of_scope:
  - payment
success_metrics:
  - staff can create student records
constraints: []
risk_level: high
chosen_track: enterprise
tech_preferences: []
external_dependencies: []
security_privacy_notes:
  - role-based access required
current_stage: STORY_READY
readiness_status: CONCERNS
`,
      "utf8"
    );
    await runCli(["new-story", "Create student profile", "--directory", root]);
    await capture(() => runCli(["readiness", "--directory", root]));
    const readiness = await fs.readFile(path.join(root, "docs/readiness-review.md"), "utf8");
    assert.match(readiness, /security-threat-model is required but missing output/i);
    assert.match(readiness, /privacy-impact-assessment is required but missing output/i);

    await runCli(["extension", "run", "before_readiness", "--directory", root]);
    await capture(() => runCli(["readiness", "--directory", root]));
    const blockedReadiness = await fs.readFile(path.join(root, "docs/readiness-review.md"), "utf8");
    assert.match(blockedReadiness, /security-threat-model output is BLOCKED/i);
    assert.match(blockedReadiness, /privacy-impact-assessment output is BLOCKED/i);
  });
});

test("github issue export creates issue markdown and index", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await runCli(["new-story", "Create student profile", "--directory", root]);
    await runCli(["github", "create-issues", "--directory", root]);
    await runCli(["github", "create-issues", "--directory", root]);
    assert.equal(await exists(path.join(root, ".blueprint/github/issues/US-001.md")), true);
    const index = JSON.parse(await fs.readFile(path.join(root, ".blueprint/github/issues.index.json"), "utf8"));
    assert.equal(index["US-001"].status, "exported");
    assert.equal(index["US-001"].body_file, ".blueprint/github/issues/US-001.md");
  });
});

test("refs index and research run create evidence-backed artifacts", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    const refRoot = path.join(root, "refs/vendor/harness-experimental");
    await fs.mkdir(refRoot, { recursive: true });
    await fs.writeFile(
      path.join(refRoot, "README.md"),
      `# Agent Harness

## Story Packets
Agents need scoped story packets, validation gates, memory, and context handoffs before implementation.
`,
      "utf8"
    );

    await runCli(["refs", "index", "--directory", root]);
    const indexSummary = JSON.parse(await fs.readFile(path.join(root, ".blueprint/refs/index.summary.json"), "utf8"));
    const indexFiles = await fs.readFile(path.join(root, ".blueprint/refs/index.files.jsonl"), "utf8");
    assert.equal(indexSummary.references.find((ref) => ref.name === "harness-experimental").file_count, 1);
    assert.match(indexFiles, /sha256/);

    await runCli(["research", "run", "--directory", root, "--topic", "agent harness", "--depth", "quick"]);
    const report = await capture(() => runCli(["research", "report", "--directory", root]));
    const validation = await capture(() => runCli(["research", "validate", "--directory", root]));
    assert.match(report, /Findings:/);
    assert.match(validation, /PASS_WITH_CONCERNS|PASS/);
    const runsRoot = path.join(root, ".blueprint/research/runs");
    const runId = (await fs.readdir(runsRoot)).sort().at(-1);
    assert.equal(await exists(path.join(runsRoot, runId, "evidence-cards.jsonl")), true);
    assert.equal(await exists(path.join(root, "docs/research/latest-reference-synthesis.md")), true);
  });
});

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
