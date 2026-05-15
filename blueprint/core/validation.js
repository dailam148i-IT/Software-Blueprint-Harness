import fs from "node:fs/promises";
import path from "node:path";
import { parseSimpleYaml } from "./simple-yaml.js";

export async function validateProject(root, requiredArtifacts) {
  const missing = [];
  const concerns = [];
  const failures = [];

  for (const artifact of requiredArtifacts) {
    try {
      await fs.access(path.join(root, artifact));
    } catch {
      missing.push(artifact);
    }
  }

  const passportPath = path.join(root, "docs/product/product-passport.yaml");
  const passportText = await readOptional(passportPath);
  const passport = passportText ? parseSimpleYaml(passportText) : null;

  if (!passport) {
    failures.push("Product Passport is missing or unreadable.");
  } else {
    for (const field of [
      "product_name",
      "product_type",
      "target_users",
      "problem",
      "in_scope",
      "out_of_scope",
      "risk_level",
      "chosen_track",
      "current_stage",
      "readiness_status"
    ]) {
      if (!(field in passport)) failures.push(`Product Passport missing field: ${field}`);
    }
    if (passport.risk_level && !["tiny", "normal", "high"].includes(passport.risk_level)) {
      failures.push(`Invalid risk_level: ${passport.risk_level}`);
    }
    if (passport.chosen_track && !["quick", "standard", "enterprise"].includes(passport.chosen_track)) {
      failures.push(`Invalid chosen_track: ${passport.chosen_track}`);
    }
  }

  const stories = await listFiles(path.join(root, "docs/stories"), ".md");
  if (stories.length === 0) {
    concerns.push("No story packets yet.");
  }

  for (const story of stories) {
    const text = await fs.readFile(path.join(root, "docs/stories", story), "utf8");
    for (const heading of ["## Status", "## Lane", "## Product Contract", "## Acceptance Criteria", "## Validation"]) {
      if (!text.includes(heading)) failures.push(`${story} missing heading: ${heading}`);
    }
  }

  const matrix = await readOptional(path.join(root, "docs/TEST_MATRIX.md"));
  if (matrix && stories.length > 0) {
    for (const story of stories) {
      const id = story.match(/US-\d{3}/)?.[0];
      if (id && !matrix.includes(id)) concerns.push(`TEST_MATRIX has no row for ${id}.`);
    }
  }

  return { missing, concerns, failures, stories };
}

async function readOptional(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function listFiles(dir, suffix) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}
