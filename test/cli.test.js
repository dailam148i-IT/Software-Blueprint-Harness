import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runCli } from "../blueprint/core/cli.js";
import { parseSimpleYaml } from "../blueprint/core/simple-yaml.js";
import { syncReferences } from "../blueprint/core/refs.js";

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
    assert.equal(await exists(path.join(root, "docs/specs/state-machines.yaml")), true);
    assert.equal(await exists(path.join(root, "docs/specs/rbac.yaml")), true);
    assert.equal(await exists(path.join(root, "docs/specs/error-codes.yaml")), true);
    assert.equal(await exists(path.join(root, "docs/EDGE_CASE_MATRIX.md")), true);
    assert.equal(await exists(path.join(root, "docs/TRACEABILITY_MATRIX.md")), true);
    assert.equal(await exists(path.join(root, "docs/ARTIFACT_DEPTH_STANDARD.md")), true);
    assert.equal(await exists(path.join(root, "docs/EXAMPLE_COMPARISON.md")), true);
    assert.equal(await exists(path.join(root, "docs/PROJECT_RECOVERY_GUIDE.md")), true);
    assert.equal(await exists(path.join(root, "docs/COMMERCE_RISK_PLAYBOOK.md")), true);
    assert.equal(await exists(path.join(root, ".github/workflows/blueprint-check.yml")), true);
    assert.equal(await exists(path.join(root, "examples/demo-student-management/README.md")), true);
    assert.equal(await exists(path.join(root, "examples/demo-student-management/docs/EDGE_CASE_MATRIX.md")), true);
    assert.equal(await exists(path.join(root, "examples/demo-student-management/docs/specs/state-machines.yaml")), true);
    assert.equal(await exists(path.join(root, "examples/demo-student-management/docs/stories/US-001-create-student-profile.md")), true);
    assert.equal(await exists(path.join(root, "extensions/security-threat-model/extension.yaml")), true);
    const extensionManifest = await fs.readFile(path.join(root, "extensions/security-threat-model/extension.yaml"), "utf8");
    const agentRules = await fs.readFile(path.join(root, "AGENTS.md"), "utf8");
    const gitignore = await fs.readFile(path.join(root, ".gitignore"), "utf8");
    const workflow = await fs.readFile(path.join(root, ".github/workflows/blueprint-check.yml"), "utf8");
    assert.match(extensionManifest, /type: quality-gate-extension/);
    assert.match(agentRules, /\/start/);
    assert.equal(await exists(path.join(root, "docs/AGENT_BOOTSTRAP.md")), true);
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

test("lint enforces production documentation gates", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    const output = await capture(() => runCli(["lint", "--directory", root]));
    assert.match(output, /FAIL blueprint production lint/);
    assert.match(output, /Product Passport field is not implementation-ready/i);
    assert.match(output, /TRACEABILITY_MATRIX still contains placeholder rows/i);
    assert.match(output, /State machine spec still contains placeholder/i);
    assert.equal(process.exitCode, 1);
    process.exitCode = 0;
  });
});

test("golden student-management demo passes production lint", async () => {
  const demoRoot = path.resolve("examples/demo-student-management");
  const output = await capture(() => runCli(["lint", "--directory", demoRoot, "--ci"]));
  assert.match(output, /PASS blueprint production lint/);
  assert.equal(process.exitCode || 0, 0);
});

test("explain-fail prints actionable repair checklist", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    const output = await capture(() => runCli(["explain-fail", "--directory", root]));
    assert.match(output, /Blueprint Repair Checklist/);
    assert.match(output, /blueprint init --directory \. --yes --merge/);
    assert.match(output, /repair:/);
  });
});

test("lint catches shallow PRD, boolean test matrix, simulated research, and status drift", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await fs.writeFile(
      path.join(root, "docs/product/product-passport.yaml"),
      `product_name: PetFoodVN
product_type: ecommerce
target_users:
  - customer
problem: Customers need checkout.
desired_outcome: Launch checkout.
in_scope:
  - payment
out_of_scope:
  - wallet
success_metrics:
  - conversion
constraints: []
risk_level: high-risk
chosen_track: standard
tech_preferences: []
external_dependencies:
  - shipping provider
security_privacy_notes:
  - PII
current_stage: STORY_READY
readiness_status: NOT_READY
`,
      "utf8"
    );
    await fs.writeFile(
      path.join(root, "docs/product/prd.md"),
      `# Product Requirements Document

## Problem
Customers need checkout.

## Users
Customers and admins.

## Scope
Checkout.

## Functional Requirements
1. Customers can checkout.

## Non-Functional Requirements
Fast enough.

## Acceptance Criteria
Checkout works.
`,
      "utf8"
    );
    await fs.writeFile(
      path.join(root, "docs/TEST_MATRIX.md"),
      `# Test Matrix

| Story | Contract | Unit | Integration | E2E | Platform | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-001 | Checkout | yes | yes | yes | web | planned | pending implementation |
`,
      "utf8"
    );
    await fs.mkdir(path.join(root, "docs/research"), { recursive: true });
    await fs.writeFile(
      path.join(root, "docs/research/synthesis.md"),
      "# Research\n\n## Source Inventory (Planned/Simulated)\n\n## Claim Map\nEvidence type: market baseline\n",
      "utf8"
    );
    const output = await capture(() => runCli(["lint", "--directory", root]));
    assert.doesNotMatch(output, /Invalid risk_level: high-risk/);
    assert.match(output, /PRD has no stable requirement IDs/i);
    assert.match(output, /TEST_MATRIX uses boolean yes\/no cells/i);
    assert.match(output, /pending implementation/i);
    assert.match(output, /simulated research/i);
    assert.match(output, /Status drift/i);
    assert.equal(process.exitCode, 1);
    process.exitCode = 0;
  });
});

test("schema validation catches malformed and schema-invalid YAML", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await fs.writeFile(path.join(root, "docs/product/product-passport.yaml"), "product_name: [broken\n", "utf8");
    let output = await capture(() => runCli(["lint", "--directory", root]));
    assert.match(output, /Product Passport is not valid YAML/i);
    assert.equal(process.exitCode, 1);
    process.exitCode = 0;

    await runCli(["init", "--directory", root, "--yes", "--override"]);
    await fs.writeFile(
      path.join(root, "docs/specs/error-codes.yaml"),
      `version: 0.1.0
errors:
  - code: bad-code
    owner: qa-agent
    http_status: "409"
    user_message: Bad code.
    retryable: "false"
    linked_story: story-one
`,
      "utf8"
    );
    output = await capture(() => runCli(["lint", "--directory", root]));
    assert.match(output, /Error-code spec failed schema validation/i);
    assert.equal(process.exitCode, 1);
    process.exitCode = 0;
  });
});

test("path safety blocks unsafe extension and reference outputs", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await fs.mkdir(path.join(root, "extensions/bad-extension"), { recursive: true });
    await fs.writeFile(
      path.join(root, "extensions/bad-extension/extension.yaml"),
      `name: bad-extension
version: 0.1.0
type: quality-gate-extension
runs_on:
  - before_readiness
outputs:
  - ../owned.md
`,
      "utf8"
    );
    const escapedOutput = path.join(path.dirname(root), "owned.md");
    await fs.rm(escapedOutput, { force: true });

    await assert.rejects(
      () => runCli(["extension", "run", "before_readiness", "--directory", root]),
      /must stay inside/i
    );
    assert.equal(await exists(escapedOutput), false);

    const repoRoot = path.join(root, "fake-framework");
    await fs.mkdir(path.join(repoRoot, "refs"), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, "refs/catalog.json"),
      JSON.stringify({ references: [{ name: "../escape", url: "https://example.invalid/repo.git" }] }),
      "utf8"
    );
    await assert.rejects(
      () => syncReferences({ repoRoot, targetRoot: root, dryRun: true }),
      /single path segment|inside/i
    );
  });
});

test("story and context packet generation work", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await runCli(["new-story", "Create student profile", "--directory", root]);
    await runCli(["export-context", "US-001", "--agent", "developer-agent", "--directory", root]);
    assert.equal(await exists(path.join(root, "docs/stories/US-001-create-student-profile.md")), true);
    assert.equal(await exists(path.join(root, ".blueprint/context-packets/US-001-developer-agent.md")), true);
    const story = await fs.readFile(path.join(root, "docs/stories/US-001-create-student-profile.md"), "utf8");
    const packet = await fs.readFile(path.join(root, ".blueprint/context-packets/US-001-developer-agent.md"), "utf8");
    assert.match(story, /## Definition of Ready/);
    assert.match(story, /## Definition of Done/);
    assert.match(story, /## Proof Format/);
    assert.match(packet, /docs\/specs\/state-machines.yaml/);
    assert.match(packet, /docs\/TRACEABILITY_MATRIX.md/);
  });
});

test("lint catches missing story trace and edge-case rows", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await runCli(["new-story", "Create student profile", "--directory", root]);
    const output = await capture(() => runCli(["lint", "--directory", root, "--ci"]));
    assert.match(output, /TRACEABILITY_MATRIX has no row for US-001/i);
    assert.match(output, /EDGE_CASE_MATRIX has no row for US-001/i);
    assert.match(output, /TEST_MATRIX has no row for US-001/i);
    assert.equal(process.exitCode, 1);
    process.exitCode = 0;
  });
});

test("start creates simple prompt workflow package", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    const output = await capture(() =>
      runCli(["start", "I need to build a student management web app", "--directory", root, "--depth", "quick"])
    );
    assert.match(output, /ask these first/i);
    const latest = JSON.parse(await fs.readFile(path.join(root, ".blueprint/intake/latest.json"), "utf8"));
    assert.match(latest.idea, /student management/);
    assert.equal(latest.approval_status, "PENDING");
    assert.equal(await exists(path.join(root, latest.intake_dir, "01-questions.md")), true);
    assert.equal(await exists(path.join(root, latest.intake_dir, "02-multi-agent-plan.md")), true);
    assert.equal(await exists(path.join(root, latest.intake_dir, "04-human-approval.md")), true);
    assert.equal(await exists(path.join(root, latest.intake_dir, "orchestrator-prompt.md")), true);
    assert.equal(await exists(path.join(root, latest.research_dir, "plan.md")), true);
    assert.equal(await exists(path.join(root, `docs/intake/${latest.run_id}.md`)), true);
  });
});

test("/start alias creates simple prompt workflow package", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    const output = await capture(() => runCli(["/start", "I need to build an app", "--directory", root]));
    assert.match(output, /created .blueprint\/intake/i);
    const latest = JSON.parse(await fs.readFile(path.join(root, ".blueprint/intake/latest.json"), "utf8"));
    assert.match(latest.idea, /build an app/);
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
    assert.match(output, /NOT_READY/);
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
    await assert.rejects(
      () => runCli(["github", "create-issues", "--directory", root, "--use-gh"]),
      /requires --repo/i
    );
    await assert.rejects(
      () => runCli(["github", "create-issues", "--directory", root, "--use-gh", "--repo", "owner/name"]),
      /confirm-publish/i
    );
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
