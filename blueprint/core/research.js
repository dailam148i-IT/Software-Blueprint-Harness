import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { indexReferences, readReferenceLock } from "./refs.js";

const DEFAULT_TOPIC = "production-grade software blueprint harness";
const TOPIC_KEYWORDS = [
  "agent",
  "workflow",
  "research",
  "gate",
  "validation",
  "memory",
  "context",
  "story",
  "architecture",
  "extension",
  "integration",
  "test",
  "release",
  "schema",
  "scrum",
  "prompt"
];

export async function createResearchPlan({ targetRoot, topic = DEFAULT_TOPIC, depth = "standard" }) {
  const runId = researchRunId(topic);
  const runDir = path.join(targetRoot, ".blueprint/research/runs", runId);
  await fs.mkdir(runDir, { recursive: true });
  const plan = `# Research Plan

Run: ${runId}
Topic: ${topic}
Depth: ${depth}
Created: ${new Date().toISOString()}

## Goal
Extract reusable software-delivery patterns from reference repositories and map them into concrete harness artifacts.

## Questions
- Which concepts are worth adopting?
- Which concepts conflict or should be rejected?
- Which CLI commands, docs, schemas, templates, extensions, or tests should change?
- Which claims have source evidence?

## Required Outputs
- source-inventory.json
- extracted-findings.json
- claim-map.json
- conflicts.md
- synthesis.md
- integration-proposal.md
`;
  await fs.writeFile(path.join(runDir, "plan.md"), plan, "utf8");
  return { runId, runDir, plan };
}

export async function runResearch({ repoRoot, targetRoot, topic = DEFAULT_TOPIC, depth = "standard" }) {
  const { runId, runDir } = await createResearchPlan({ targetRoot, topic, depth });
  const index = await indexReferences({ repoRoot, targetRoot });
  const lock = await readReferenceLock(targetRoot);
  const findings = [];
  const notes = [];

  for (const reference of index.references) {
    const selectedFiles = selectReferenceFiles(reference, topic, depth);
    const referenceFindings = [];
    for (const file of selectedFiles) {
      const fileFindings = await extractFindings({ targetRoot, reference, file, topic });
      referenceFindings.push(...fileFindings);
      findings.push(...fileFindings);
    }
    notes.push(renderReferenceNote(reference, referenceFindings));
  }

  const claimMap = buildClaimMap(findings);
  const conflicts = renderConflicts(findings);
  const synthesis = renderSynthesis({ topic, depth, index, findings, claimMap });
  const proposal = renderIntegrationProposal(claimMap);

  await fs.writeFile(path.join(runDir, "source-inventory.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(runDir, "manifest.json"), `${JSON.stringify({ schema_version: 1, run_id: runId, topic, depth, created_at: new Date().toISOString() }, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(runDir, "lock-snapshot.json"), `${JSON.stringify(lock || { references: [] }, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(runDir, "extracted-findings.json"), `${JSON.stringify(findings, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(runDir, "findings.jsonl"), `${findings.map((finding) => JSON.stringify(finding)).join("\n")}\n`, "utf8");
  await fs.writeFile(path.join(runDir, "evidence-cards.jsonl"), `${findings.map((finding) => JSON.stringify(toEvidenceCard(finding))).join("\n")}\n`, "utf8");
  await fs.writeFile(path.join(runDir, "claim-map.json"), `${JSON.stringify(claimMap, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(runDir, "conflicts.md"), conflicts, "utf8");
  await fs.writeFile(path.join(runDir, "synthesis.md"), synthesis, "utf8");
  await fs.writeFile(path.join(runDir, "integration-proposal.md"), proposal, "utf8");

  await writeResearchDocs(targetRoot, notes, synthesis);
  return { runId, runDir, index, findings, claimMap };
}

export async function synthesizeResearch({ targetRoot, runId = null }) {
  const runDir = await resolveRunDir(targetRoot, runId);
  const findings = await readJson(path.join(runDir, "extracted-findings.json"), []);
  const claimMap = await readJson(path.join(runDir, "claim-map.json"), { claims: [] });
  const inventory = await readJson(path.join(runDir, "source-inventory.json"), { references: [] });
  const topic = await readTopicFromPlan(path.join(runDir, "plan.md"));
  const synthesis = renderSynthesis({ topic, depth: "existing-run", index: inventory, findings, claimMap });
  await fs.writeFile(path.join(runDir, "synthesis.md"), synthesis, "utf8");
  await fs.mkdir(path.join(targetRoot, "docs/research"), { recursive: true });
  await fs.writeFile(path.join(targetRoot, "docs/research/latest-reference-synthesis.md"), synthesis, "utf8");
  return { runDir, synthesis };
}

export async function reportResearch({ targetRoot, runId = null }) {
  const runDir = await resolveRunDir(targetRoot, runId);
  const findings = await readJson(path.join(runDir, "extracted-findings.json"), []);
  const claimMap = await readJson(path.join(runDir, "claim-map.json"), { claims: [] });
  const inventory = await readJson(path.join(runDir, "source-inventory.json"), { references: [] });
  return {
    run: path.basename(runDir),
    references: inventory.references?.length || 0,
    present_references: inventory.references?.filter((ref) => ref.status === "present").length || 0,
    findings: findings.length,
    claims: claimMap.claims?.length || 0,
    synthesis: path.join(path.relative(targetRoot, runDir).replaceAll("\\", "/"), "synthesis.md")
  };
}

export async function validateResearch({ targetRoot, runId = null }) {
  const blockers = [];
  const concerns = [];
  let runDir = null;

  try {
    runDir = await resolveRunDir(targetRoot, runId);
  } catch {
    blockers.push("No research run exists. Run `blueprint research run`.");
    return { status: "FAIL", blockers, concerns };
  }

  const findings = await readJson(path.join(runDir, "extracted-findings.json"), []);
  const claimMap = await readJson(path.join(runDir, "claim-map.json"), { claims: [] });
  const inventory = await readJson(path.join(runDir, "source-inventory.json"), { references: [] });
  const synthesisExists = await pathExists(path.join(runDir, "synthesis.md"));
  const evidenceCards = await readJsonl(path.join(runDir, "evidence-cards.jsonl"));

  if (!synthesisExists) blockers.push("Research synthesis is missing.");
  if (findings.length === 0) blockers.push("Research run has no extracted findings.");
  if (evidenceCards.length === 0) blockers.push("Research run has no evidence cards.");
  for (const claim of claimMap.claims || []) {
    if (!claim.sources || claim.sources.length === 0) {
      blockers.push(`Claim has no source evidence: ${claim.claim}`);
    }
  }
  for (const card of evidenceCards) {
    const result = await validateEvidenceCard(targetRoot, card);
    if (!result.ok) blockers.push(result.message);
  }

  for (const reference of inventory.references || []) {
    if (reference.status !== "present") {
      concerns.push(`Reference not synced: ${reference.name}`);
    } else if (reference.file_count === 0) {
      concerns.push(`Reference has no indexed files: ${reference.name}`);
    }
  }

  return {
    status: blockers.length ? "FAIL" : concerns.length ? "PASS_WITH_CONCERNS" : "PASS",
    run: path.basename(runDir),
    blockers,
    concerns
  };
}

function selectReferenceFiles(reference, topic, depth) {
  if (reference.status !== "present") return [];
  const limit = depth === "deep" ? 16 : depth === "quick" ? 4 : 8;
  const topicTerms = researchTerms(topic);
  return [...reference.files]
    .map((file) => ({ file, score: scoreFile(file, topicTerms) }))
    .filter((row) => row.score > 0 || /readme|docs|guide|workflow|agent|method/i.test(row.file.path))
    .sort((a, b) => b.score - a.score || a.file.path.localeCompare(b.file.path))
    .slice(0, limit)
    .map((row) => row.file);
}

async function extractFindings({ targetRoot, reference, file, topic }) {
  const fullPath = path.join(targetRoot, reference.root, file.path);
  const text = await fs.readFile(fullPath, "utf8").catch(() => "");
  const lines = text.split(/\r?\n/);
  const terms = researchTerms(topic);
  const findings = [];

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index].trim();
    if (!raw) continue;
    const normalized = raw.toLowerCase();
    const isHeading = /^#{1,4}\s+/.test(raw);
    const hits = terms.filter((term) => normalized.includes(term));
    if (!isHeading && hits.length === 0) continue;
    const evidence = raw.replace(/^#{1,4}\s+/, "").slice(0, 240);
    findings.push({
      id: `${reference.name}:${file.path}:${index + 1}`,
      reference: reference.name,
      claim: inferClaim(reference, evidence, hits, isHeading),
      evidence,
      source_span: {
        path: `${reference.root}/${file.path}`,
        start_line: index + 1,
        end_line: index + 1,
        commit: reference.commit
      },
      quote_hash: hashText(evidence),
      evidence_type: isHeading ? "concept_marker" : "guidance",
      confidence: isHeading ? "medium" : "high",
      limitations: isHeading ? "Heading-only evidence; verify surrounding section before integration." : "",
      source: {
        reference: reference.name,
        path: `${reference.root}/${file.path}`,
        line: index + 1,
        commit: reference.commit
      },
      maps_to: mapFindingToHarness(evidence, hits)
    });
    if (findings.length >= 8) break;
  }

  return findings;
}

function toEvidenceCard(finding) {
  return {
    schema_version: 1,
    claim: finding.claim,
    source_span: finding.source_span,
    quote_hash: finding.quote_hash,
    evidence_type: finding.evidence_type,
    confidence: finding.confidence,
    maps_to: finding.maps_to,
    limitations: finding.limitations
  };
}

function buildClaimMap(findings) {
  const claims = new Map();
  for (const finding of findings) {
    const key = finding.claim;
    if (!claims.has(key)) {
      claims.set(key, {
        claim: finding.claim,
        maps_to: finding.maps_to,
        sources: []
      });
    }
    claims.get(key).sources.push(finding.source);
  }
  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    claims: [...claims.values()]
  };
}

async function writeResearchDocs(targetRoot, notes, synthesis) {
  const notesDir = path.join(targetRoot, "docs/research/reference-notes");
  await fs.mkdir(notesDir, { recursive: true });
  for (const note of notes) {
    await fs.writeFile(path.join(notesDir, `${note.reference}.md`), note.content, "utf8");
  }
  await fs.mkdir(path.join(targetRoot, "docs/research"), { recursive: true });
  await fs.writeFile(path.join(targetRoot, "docs/research/latest-reference-synthesis.md"), synthesis, "utf8");
}

function renderReferenceNote(reference, findings) {
  const rows = findings.length
    ? findings
        .map((finding) => `- ${finding.claim} (${finding.source.path}:${finding.source.line})`)
        .join("\n")
    : "- No findings extracted. Sync refs or increase depth.";
  return {
    reference: reference.name,
    content: `# Reference Notes: ${reference.name}

URL: ${reference.url}
Role: ${reference.role}
Status: ${reference.status}
Commit: ${reference.commit || "missing"}

## Findings
${rows}
`
  };
}

function renderSynthesis({ topic, depth, index, findings, claimMap }) {
  const present = index.references?.filter((ref) => ref.status === "present") || [];
  const missing = index.references?.filter((ref) => ref.status !== "present") || [];
  const claims = claimMap.claims || [];
  return `# Latest Reference Synthesis

Topic: ${topic}
Depth: ${depth}
Generated: ${new Date().toISOString()}

## Source Coverage
- Present references: ${present.length}
- Missing references: ${missing.length}
- Extracted findings: ${findings.length}
- Evidence-backed claims: ${claims.length}

## Claims To Integrate
${claims.length ? claims.map((claim) => `- ${claim.claim} -> ${claim.maps_to}`).join("\n") : "- No claims extracted yet."}

## Source Notes
${present.map((ref) => `- ${ref.name}: ${ref.file_count} indexed files at ${ref.commit || "unknown commit"}`).join("\n") || "- No synced references."}

## Missing Sources
${missing.map((ref) => `- ${ref.name}: run \`blueprint refs sync\``).join("\n") || "- None"}

## Next Actions
- Review claim-map.json before changing core behavior.
- Convert accepted claims into decision records or harness backlog items.
- Add tests for any CLI, schema, template, or gate change inspired by this run.
`;
}

function renderConflicts(findings) {
  const byMap = new Map();
  for (const finding of findings) {
    if (!byMap.has(finding.maps_to)) byMap.set(finding.maps_to, new Set());
    byMap.get(finding.maps_to).add(finding.reference);
  }
  const potential = [...byMap.entries()].filter(([, refs]) => refs.size > 1);
  return `# Research Conflicts

## Potential Cross-Reference Tensions
${potential.length ? potential.map(([area, refs]) => `- ${area}: compare ${[...refs].join(", ")}`).join("\n") : "- None detected by heuristic scan."}

## Human Review Rule
Any conflict that changes workflow, gate strictness, or agent autonomy must become a decision record before implementation.
`;
}

function renderIntegrationProposal(claimMap) {
  return `# Integration Proposal

## Proposed Harness Changes
${claimMap.claims?.length ? claimMap.claims.map((claim) => `- ${claim.maps_to}: ${claim.claim}`).join("\n") : "- No proposals yet."}

## Acceptance Rule
Each proposal needs an owner, artifact target, and test before it can be merged into the framework.
`;
}

function inferClaim(reference, evidence, hits, isHeading) {
  const subject = evidence.replace(/[:.]+$/, "");
  if (isHeading) return `${reference.name} treats "${subject}" as a named concept.`;
  const hit = hits[0] || "process";
  return `${reference.name} contains guidance related to ${hit}: ${subject}`;
}

function mapFindingToHarness(evidence, hits) {
  const text = `${evidence} ${hits.join(" ")}`.toLowerCase();
  if (/schema|validate|validation|gate|quality/.test(text)) return "schemas and readiness gates";
  if (/agent|context|memory|handoff|prompt/.test(text)) return "agent context, memory, and prompts";
  if (/story|scrum|agile|backlog/.test(text)) return "stories and agile workflow";
  if (/extension|integration|github|tool/.test(text)) return "extensions and integrations";
  if (/research|source|evidence|citation/.test(text)) return "research pipeline and evidence";
  if (/architecture|design|module/.test(text)) return "architecture and solution design";
  return "harness documentation";
}

function scoreFile(file, topicTerms) {
  const haystack = `${file.path} ${(file.headings || []).join(" ")} ${(file.keywords || []).join(" ")}`.toLowerCase();
  return topicTerms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function researchTerms(topic) {
  const fromTopic = String(topic || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);
  return [...new Set([...fromTopic, ...TOPIC_KEYWORDS])];
}

function researchRunId(topic) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "Z");
  const slug = String(topic || DEFAULT_TOPIC)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return `${stamp}-${slug || "research"}`;
}

async function resolveRunDir(targetRoot, runId) {
  const runsRoot = path.join(targetRoot, ".blueprint/research/runs");
  if (runId) {
    const explicit = path.join(runsRoot, runId);
    if (await pathExists(explicit)) return explicit;
    throw new Error(`research run not found: ${runId}`);
  }
  const entries = await fs.readdir(runsRoot, { withFileTypes: true }).catch(() => []);
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (dirs.length === 0) throw new Error("no research runs found");
  return path.join(runsRoot, dirs[dirs.length - 1]);
}

async function readTopicFromPlan(planPath) {
  const text = await fs.readFile(planPath, "utf8").catch(() => "");
  return text.match(/^Topic:\s*(.+)$/m)?.[1] || DEFAULT_TOPIC;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readJsonl(filePath) {
  const text = await fs.readFile(filePath, "utf8").catch(() => "");
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function validateEvidenceCard(targetRoot, card) {
  if (!card.claim) return { ok: false, message: "Evidence card missing claim." };
  if (!card.source_span?.path || !card.source_span?.start_line || !card.source_span?.end_line) {
    return { ok: false, message: `Evidence card has invalid source span: ${card.claim}` };
  }
  const filePath = path.join(targetRoot, card.source_span.path);
  const text = await fs.readFile(filePath, "utf8").catch(() => "");
  if (!text) return { ok: false, message: `Evidence source missing: ${card.source_span.path}` };
  const lines = text.split(/\r?\n/);
  const selected = lines
    .slice(card.source_span.start_line - 1, card.source_span.end_line)
    .map((line) => line.trim().replace(/^#{1,4}\s+/, "").slice(0, 240))
    .join("\n");
  if (hashText(selected) !== card.quote_hash) {
    return { ok: false, message: `Evidence hash mismatch: ${card.source_span.path}:${card.source_span.start_line}` };
  }
  return { ok: true };
}

function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
