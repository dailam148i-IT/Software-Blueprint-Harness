import fs from "node:fs/promises";
import path from "node:path";
import { parseSimpleYaml } from "./simple-yaml.js";

export async function validateProject(root, requiredArtifacts, options = {}) {
  const missing = [];
  const concerns = [];
  const failures = [];
  const readiness = Boolean(options.readiness);
  const qualityIssues = readiness ? failures : concerns;

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
    const requiredFields = [
      "product_name",
      "product_type",
      "target_users",
      "problem",
      "desired_outcome",
      "in_scope",
      "out_of_scope",
      "success_metrics",
      "risk_level",
      "chosen_track",
      "current_stage",
      "readiness_status"
    ];

    for (const field of requiredFields) {
      if (!(field in passport)) failures.push(`Product Passport missing field: ${field}`);
    }

    for (const field of [
      "product_name",
      "product_type",
      "target_users",
      "problem",
      "desired_outcome",
      "in_scope",
      "out_of_scope",
      "success_metrics"
    ]) {
      if (field in passport && isPlaceholder(passport[field])) {
        qualityIssues.push(`Product Passport field is not implementation-ready: ${field}`);
      }
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
    if (hasStoryPlaceholder(text)) {
      qualityIssues.push(`${story} still contains placeholder story content.`);
    }
    if (hasBlankAgentOwnership(text)) {
      qualityIssues.push(`${story} has no implementation agent ownership.`);
    }
  }

  const matrix = await readOptional(path.join(root, "docs/TEST_MATRIX.md"));
  if (matrix && stories.length > 0) {
    for (const story of stories) {
      const id = story.match(/US-\d{3}/)?.[0];
      if (id && !matrix.includes(id)) qualityIssues.push(`TEST_MATRIX has no row for ${id}.`);
    }
  }
  if (matrix && matrix.includes("| TBD |")) {
    qualityIssues.push("TEST_MATRIX still contains placeholder TBD row.");
  }

  await validateDocumentReadiness(root, qualityIssues);

  return { missing, concerns, failures, stories };
}

async function validateDocumentReadiness(root, qualityIssues) {
  const documents = [
    {
      path: "docs/product/prd.md",
      label: "PRD",
      placeholders: ["## Problem", "## Users", "## Scope", "## Functional Requirements", "## Acceptance Criteria"]
    },
    {
      path: "docs/product/ux-spec.md",
      label: "UX Spec",
      placeholders: ["## User Journeys", "## Screens", "## States", "## Accessibility"]
    },
    {
      path: "docs/product/data-api-contract.md",
      label: "Data/API Contract",
      placeholders: ["## Entities", "## Commands", "## Queries", "## Validation and Errors", "## Permissions"]
    },
    {
      path: "docs/architecture.md",
      label: "Architecture",
      placeholders: ["## Stack", "## Product Surfaces", "## Module Boundaries", "## Deployment", "## Security"]
    }
  ];

  for (const document of documents) {
    const text = await readOptional(path.join(root, document.path));
    if (!text) continue;

    if (containsTbd(text)) {
      qualityIssues.push(`${document.label} still contains TBD placeholders.`);
      continue;
    }

    for (const heading of document.placeholders) {
      if (!text.includes(heading)) {
        qualityIssues.push(`${document.label} missing section: ${heading}`);
        continue;
      }
      if (sectionLooksEmpty(text, heading)) {
        qualityIssues.push(`${document.label} section is empty or placeholder: ${heading}`);
      }
    }
  }
}

function isPlaceholder(value) {
  if (Array.isArray(value)) return value.length === 0 || value.every(isPlaceholder);
  if (value && typeof value === "object") return Object.keys(value).length === 0;
  if (value === null || value === undefined) return true;
  const text = String(value).trim();
  if (!text) return true;
  return /^(TBD|TODO|N\/A|none|unknown)$/i.test(text);
}

function containsTbd(text) {
  return /\b(TBD|TODO)\b/i.test(text);
}

function hasStoryPlaceholder(text) {
  return [
    "Describe the behavior this story must make true.",
    "Criterion 1.",
    "Criterion 2.",
    "Criterion 3.",
    "Expected proof",
    "| Unit | |",
    "| Integration | |",
    "| E2E | |",
    "| Platform | |"
  ].some((marker) => text.includes(marker));
}

function hasBlankAgentOwnership(text) {
  const match = text.match(/^Primary agent:\s*(.*)$/im);
  return Boolean(match && !match[1].trim());
}

function sectionLooksEmpty(text, heading) {
  const start = text.indexOf(heading);
  if (start === -1) return true;
  const afterHeading = text.slice(start + heading.length);
  const next = afterHeading.search(/\n##\s+/);
  const body = (next === -1 ? afterHeading : afterHeading.slice(0, next))
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
  if (!body) return true;
  return body
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .every((line) => /^(TBD|TODO|N\/A|none|unknown)$/i.test(line));
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
