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
    for (const heading of [
      "## Definition of Ready",
      "## Definition of Done",
      "## Machine-Readable Contract Links",
      "## Edge Cases",
      "## Agent Ownership",
      "## Proof Format"
    ]) {
      if (!text.includes(heading)) qualityIssues.push(`${story} missing production story section: ${heading}`);
    }
    if (hasStoryPlaceholder(text)) {
      qualityIssues.push(`${story} still contains placeholder story content.`);
    }
    if (hasBlankAgentOwnership(text)) {
      qualityIssues.push(`${story} has incomplete implementation agent ownership or file boundaries.`);
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

  await validateTraceability(root, stories, qualityIssues);
  await validateEdgeCases(root, stories, qualityIssues);
  await validateStructuredSpecs(root, qualityIssues);
  await validateDocumentReadiness(root, qualityIssues);

  return { missing, concerns, failures, stories };
}

export async function lintProject(root, requiredArtifacts) {
  return validateProject(root, requiredArtifacts, { readiness: true });
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
      path: "docs/product/integration-protocol.md",
      label: "Integration Protocol",
      placeholders: [
        "## Idempotency Keys",
        "## Retry Policy",
        "## Signature Validation",
        "## Callback Handling",
        "## Dead Letter Handling",
        "## Reconcile Runbook",
        "## Observability",
        "## Security",
        "## Test Requirements"
      ]
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

async function validateTraceability(root, stories, qualityIssues) {
  const text = await readOptional(path.join(root, "docs/TRACEABILITY_MATRIX.md"));
  if (!text) return;
  if (containsTbd(text) || text.includes("US-000")) {
    qualityIssues.push("TRACEABILITY_MATRIX still contains placeholder rows.");
  }

  if (stories.length === 0) return;
  if (!text.includes("| US-")) {
    qualityIssues.push("TRACEABILITY_MATRIX has no story rows yet.");
  }
  for (const story of stories) {
    const id = story.match(/US-\d{3}/)?.[0];
    if (id && !text.includes(id)) qualityIssues.push(`TRACEABILITY_MATRIX has no row for ${id}.`);
  }
}

async function validateEdgeCases(root, stories, qualityIssues) {
  const text = await readOptional(path.join(root, "docs/EDGE_CASE_MATRIX.md"));
  if (!text) return;
  if (containsTbd(text) || text.includes("US-000")) {
    qualityIssues.push("EDGE_CASE_MATRIX still contains placeholder ownership or story rows.");
  }

  const context = await readProductContext(root);
  const needsCommerceFlows = /payment|checkout|order|inventory|shipping|refund|callback|webhook/.test(context);
  if (needsCommerceFlows) {
    for (const requiredFlow of [
      "duplicate callback",
      "late callback",
      "out of stock",
      "refund",
      "timeout",
      "dead-letter",
      "reconcile"
    ]) {
      if (!normalizeText(text).includes(normalizeText(requiredFlow))) {
        qualityIssues.push(`EDGE_CASE_MATRIX missing standard commerce/integration flow: ${requiredFlow}.`);
      }
    }
  }

  for (const story of stories) {
    const id = story.match(/US-\d{3}/)?.[0];
    if (id && !text.includes(id)) qualityIssues.push(`EDGE_CASE_MATRIX has no row for ${id}.`);
  }
}

async function readProductContext(root) {
  const files = [
    "docs/product/product-passport.yaml",
    "docs/product/prd.md",
    "docs/product/data-api-contract.md",
    "docs/product/integration-protocol.md",
    "docs/specs/state-machines.yaml",
    "docs/specs/error-codes.yaml"
  ];
  const chunks = [];
  for (const file of files) {
    chunks.push(await readOptional(path.join(root, file)));
  }
  return normalizeText(chunks.join("\n"));
}

async function validateStructuredSpecs(root, qualityIssues) {
  const specs = [
    {
      path: "docs/specs/state-machines.yaml",
      label: "State machine spec",
      key: "state_machines",
      requiredText: ["transitions", "guards", "side_effects", "errors"]
    },
    {
      path: "docs/specs/rbac.yaml",
      label: "RBAC spec",
      key: "roles",
      requiredText: ["permissions", "resources", "rules"]
    },
    {
      path: "docs/specs/error-codes.yaml",
      label: "Error-code spec",
      key: "errors",
      requiredText: ["code:", "http_status", "retryable", "linked_story"]
    }
  ];

  for (const spec of specs) {
    const text = await readOptional(path.join(root, spec.path));
    if (!text) continue;
    const parsed = parseSimpleYaml(text);
    const entries = parsed ? parsed[spec.key] : null;
    if (!Array.isArray(entries) || entries.length === 0) {
      qualityIssues.push(`${spec.label} has no ${spec.key} entries.`);
    }
    if (containsTbd(text) || text.includes("US-000")) {
      qualityIssues.push(`${spec.label} still contains placeholder owners or story links.`);
    }
    for (const marker of spec.requiredText) {
      if (!text.includes(marker)) qualityIssues.push(`${spec.label} missing required marker: ${marker}.`);
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
    "Link rows from docs/EDGE_CASE_MATRIX.md or explain why none apply.",
    "Criterion 1.",
    "Criterion 2.",
    "Criterion 3.",
    "Expected proof",
    "Owner: TBD",
    "Primary agent: TBD",
    "Handoff target: TBD",
    "Files/modules allowed: TBD",
    "Files/modules forbidden: TBD",
    "| Unit | |",
    "| Integration | |",
    "| E2E | |",
    "| Platform | |"
  ].some((marker) => text.includes(marker));
}

function hasBlankAgentOwnership(text) {
  const primary = text.match(/^\s*-?\s*Primary agent:\s*(.*)$/im);
  const allowed = text.match(/^\s*-?\s*Files\/modules allowed:\s*(.*)$/im);
  const forbidden = text.match(/^\s*-?\s*Files\/modules forbidden:\s*(.*)$/im);
  return [primary, allowed, forbidden].some((match) => !match || isPlaceholder(match[1]));
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

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
