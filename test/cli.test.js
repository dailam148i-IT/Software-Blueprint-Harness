import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runCli } from "../blueprint/core/cli.js";

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
    assert.equal(await exists(path.join(root, "docs/extensions/security-threat-model.md")), true);
  });
});

test("memory update and compact create memory outputs", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await runCli(["memory", "update", "--directory", root]);
    await runCli(["memory", "compact", "--directory", root]);
    assert.equal(await exists(path.join(root, ".blueprint/memory/project-memory.yaml")), true);
    assert.equal(await exists(path.join(root, ".blueprint/memory/compact-context.md")), true);
  });
});

test("github issue export creates issue markdown", async () => {
  await withTempProject(async (root) => {
    await runCli(["init", "--directory", root, "--yes"]);
    await runCli(["new-story", "Create student profile", "--directory", root]);
    await runCli(["github", "create-issues", "--directory", root]);
    assert.equal(await exists(path.join(root, ".blueprint/github/issues/US-001.md")), true);
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
