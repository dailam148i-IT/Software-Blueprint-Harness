#!/usr/bin/env node
import { runCli } from "../blueprint/core/cli.js";

const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith("--") ? args : ["init", ...args];

runCli(command).catch((error) => {
  console.error(`install: ${error.message}`);
  process.exit(1);
});
