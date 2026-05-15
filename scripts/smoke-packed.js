import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "blueprint-pack-smoke-"));
const npmCommand = process.env.npm_execpath ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm";
const npmPrefix = process.env.npm_execpath ? [process.env.npm_execpath] : [];

try {
  const tarball = (await capture(npmCommand, [...npmPrefix, "pack", "--silent"], repoRoot)).trim().split(/\r?\n/).at(-1);
  if (!tarball) throw new Error("npm pack did not return a tarball name.");

  const tarballPath = path.join(repoRoot, tarball);
  await capture(npmCommand, [...npmPrefix, "init", "-y"], tempRoot);
  await capture(npmCommand, [...npmPrefix, "install", tarballPath], tempRoot);

  const binPath = path.join(tempRoot, "node_modules/software-blueprint-harness/bin/blueprint.js");
  const version = await capture(process.execPath, [binPath, "--version"], tempRoot);
  if (!/\d+\.\d+\.\d+/.test(version)) throw new Error(`unexpected version output: ${version}`);

  const projectRoot = path.join(tempRoot, "project");
  await fs.mkdir(projectRoot);
  await capture(process.execPath, [binPath, "init", "--directory", projectRoot, "--yes", "--with-github"], tempRoot);
  const check = await capture(process.execPath, [binPath, "check", "--directory", projectRoot], tempRoot);
  if (!/PASS_WITH_CONCERNS|PASS/.test(check)) throw new Error(`unexpected check output: ${check}`);

  await fs.rm(tarballPath, { force: true });
  console.log("packed smoke PASS");
} finally {
  await fs.rm(tempRoot, { recursive: true, force: true });
}

function capture(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"], shell: false });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} ${args.join(" ")} failed with ${code}\n${stdout}\n${stderr}`));
    });
    child.on("error", reject);
  });
}
