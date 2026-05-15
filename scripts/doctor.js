#!/usr/bin/env node
import { runCli } from "../blueprint/core/cli.js";

runCli(["doctor", ...process.argv.slice(2)]).catch((error) => {
  console.error(`doctor: ${error.message}`);
  process.exit(1);
});
