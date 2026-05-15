import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { parseSimpleYaml, parseYamlDocument } from "./simple-yaml.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaRoot = path.resolve(__dirname, "../schemas");
const ajv = new Ajv2020({ allErrors: true, strict: false });
const schemaCache = new Map();

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
  if (passportText) {
    await validateYamlSchema(root, "docs/product/product-passport.yaml", "product-passport.schema.json", "Product Passport", failures);
  }

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

    if (passport.risk_level && !["tiny", "normal", "high", "high-risk"].includes(passport.risk_level)) {
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
  validateTestMatrixDepth(matrix, qualityIssues);

  await validateTraceability(root, stories, qualityIssues);
  await validateEdgeCases(root, stories, qualityIssues);
  await validateStructuredSpecs(root, qualityIssues);
  await validateExtensionManifests(root, failures);
  await validateDocumentReadiness(root, qualityIssues);
  await validateResearchDepth(root, qualityIssues);
  await validateStatusConsistency(root, passport, qualityIssues);

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
      placeholders: ["## Problem", "## Personas", "## Scope", "## Functional Requirements", "## Acceptance Criteria"]
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

    if (document.label === "PRD") validatePrdDepth(text, qualityIssues);
    if (document.label === "Data/API Contract") validateDataApiDepth(text, qualityIssues);
  }
}

function validatePrdDepth(text, qualityIssues) {
  if (!/\bREQ-[A-Z0-9]+-\d{3}\b/.test(text)) {
    qualityIssues.push("PRD has no stable requirement IDs such as REQ-ORDER-001.");
  }
  if (!/\bAC-[A-Z0-9]+-\d{3}\b/.test(text)) {
    qualityIssues.push("PRD has no stable acceptance criteria IDs such as AC-ORDER-001.");
  }
  for (const section of ["## Personas", "## Business Rules", "## Scope By Release"]) {
    if (!text.includes(section)) qualityIssues.push(`PRD missing depth section: ${section}.`);
  }
  if (!/Owner\s*\|.*Severity|Severity\s*\|.*Owner/i.test(text)) {
    qualityIssues.push("PRD assumptions/open questions need owner and severity columns.");
  }
}

function validateDataApiDepth(text, qualityIssues) {
  for (const marker of [
    "Request",
    "Response",
    "Status Code",
    "Idempotency",
    "Authorization",
    "Event Payload"
  ]) {
    if (!text.includes(marker)) {
      qualityIssues.push(`Data/API Contract missing implementation detail marker: ${marker}.`);
    }
  }
}

function validateTestMatrixDepth(matrix, qualityIssues) {
  if (!matrix) return;
  const normalized = normalizeText(matrix);
  if (/\|\s*yes\s*\|\s*yes\s*\|\s*yes\s*\|/i.test(matrix) || /\|\s*no\s*\|\s*no\s*\|/i.test(matrix)) {
    qualityIssues.push("TEST_MATRIX uses boolean yes/no cells instead of named scenarios and proof.");
  }
  if (normalized.includes("pending implementation")) {
    qualityIssues.push("TEST_MATRIX evidence is still pending implementation.");
  }
  if (!/\bREQ-[A-Z0-9]+-\d{3}\b/.test(matrix)) {
    qualityIssues.push("TEST_MATRIX has no requirement IDs.");
  }
  if (!/\bTC-[A-Z0-9]+-\d{3}\b/.test(matrix)) {
    qualityIssues.push("TEST_MATRIX has no test scenario IDs.");
  }
  for (const heading of ["Command", "Fixture", "Evidence", "Owner"]) {
    if (!matrix.includes(heading)) qualityIssues.push(`TEST_MATRIX missing column or marker: ${heading}.`);
  }
}

async function validateResearchDepth(root, qualityIssues) {
  const researchFiles = await listFiles(path.join(root, "docs/research"), ".md");
  for (const file of researchFiles) {
    const text = await readOptional(path.join(root, "docs/research", file));
    if (/planned\/simulated|simulated for intake|evidence type:/i.test(text)) {
      qualityIssues.push(`${file} appears to contain simulated research instead of source-backed evidence.`);
    }
    if (text && !/source inventory/i.test(text)) {
      qualityIssues.push(`${file} missing source inventory.`);
    }
    if (text && !/claim map/i.test(text)) {
      qualityIssues.push(`${file} missing claim map.`);
    }
  }
}

async function validateStatusConsistency(root, passport, qualityIssues) {
  const statusText = await readOptional(path.join(root, ".blueprint/status.json"));
  if (!statusText || !passport) return;
  let status = null;
  try {
    status = JSON.parse(statusText);
  } catch {
    qualityIssues.push(".blueprint/status.json is not valid JSON.");
    return;
  }

  const passportRisk = normalizeRisk(passport.risk_level);
  const statusRisk = normalizeRisk(status.risk);
  if (passportRisk && statusRisk && passportRisk !== statusRisk) {
    qualityIssues.push(`Status drift: Product Passport risk_level is ${passport.risk_level}, but .blueprint/status.json risk is ${status.risk}.`);
  }
  if (passport.current_stage && status.stage && passport.current_stage !== status.stage) {
    qualityIssues.push(`Status drift: Product Passport current_stage is ${passport.current_stage}, but .blueprint/status.json stage is ${status.stage}.`);
  }
  if (passport.readiness_status && status.readiness && passport.readiness_status !== status.readiness) {
    qualityIssues.push(`Status drift: Product Passport readiness_status is ${passport.readiness_status}, but .blueprint/status.json readiness is ${status.readiness}.`);
  }
}

function normalizeRisk(value) {
  return String(value || "")
    .toLowerCase()
    .replace("high-risk", "high")
    .trim();
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
      schema: "state-machine.schema.json",
      requiredText: ["transitions", "guards", "side_effects", "errors"]
    },
    {
      path: "docs/specs/rbac.yaml",
      label: "RBAC spec",
      key: "roles",
      schema: "rbac.schema.json",
      requiredText: ["permissions", "resources", "rules"]
    },
    {
      path: "docs/specs/error-codes.yaml",
      label: "Error-code spec",
      key: "errors",
      schema: "error-codes.schema.json",
      requiredText: ["code:", "http_status", "retryable", "linked_story"]
    }
  ];

  for (const spec of specs) {
    const text = await readOptional(path.join(root, spec.path));
    if (!text) continue;
    await validateYamlSchema(root, spec.path, spec.schema, spec.label, qualityIssues);
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

async function validateExtensionManifests(root, failures) {
  const extRoot = path.join(root, "extensions");
  let entries = [];
  try {
    entries = await fs.readdir(extRoot, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const relativePath = path.join("extensions", entry.name, "extension.yaml").replaceAll("\\", "/");
    const text = await readOptional(path.join(root, relativePath));
    if (!text) continue;
    await validateYamlSchema(root, relativePath, "extension.schema.json", `${entry.name} extension manifest`, failures);
  }
}

async function validateYamlSchema(root, relativePath, schemaFile, label, issues) {
  const absolutePath = path.join(root, relativePath);
  const text = await readOptional(absolutePath);
  if (!text) return;

  const parsed = parseYamlDocument(text);
  if (parsed.error) {
    issues.push(`${label} is not valid YAML: ${parsed.error.message}`);
    return;
  }

  const validate = await loadSchema(schemaFile);
  if (!validate(parsed.data)) {
    const detail = ajv.errorsText(validate.errors, { separator: "; " });
    issues.push(`${label} failed schema validation: ${detail}`);
  }
}

async function loadSchema(schemaFile) {
  if (schemaCache.has(schemaFile)) return schemaCache.get(schemaFile);
  const schema = JSON.parse(await fs.readFile(path.join(schemaRoot, schemaFile), "utf8"));
  const validate = ajv.compile(schema);
  schemaCache.set(schemaFile, validate);
  return validate;
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
  return /\b(TBD|TODO|coming soon|to be defined|lorem ipsum|sample placeholder)\b|chưa xác định/i.test(text);
}

function hasStoryPlaceholder(text) {
  return [
    "Describe the behavior this story must make true.",
    "Link rows from docs/EDGE_CASE_MATRIX.md or explain why none apply.",
    "Criterion 1.",
    "Criterion 2.",
    "Criterion 3.",
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
