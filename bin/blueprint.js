#!/usr/bin/env node
import { runCli } from "../blueprint/core/cli.js";

runCli(process.argv.slice(2)).catch((error) => {
  console.error(`blueprint: ${error.message}`);
  if (process.env.BLUEPRINT_DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});
