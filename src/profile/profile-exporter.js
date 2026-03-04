const fs = require("node:fs/promises");
const path = require("node:path");
const { createEmptyProfile } = require("./profile-schema");
const { getByPath } = require("../utils/object-path");

const SUPPORTED_FORMATS = new Set(["json", "markdown", "summary", "rag-chunks"]);
const REQUIRED_PATHS = collectPaths(createEmptyProfile("__schema__"));

function collectPaths(source, prefix = "") {
  const paths = [];
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return paths;
  }
  for (const key of Object.keys(source)) {
    const next = prefix ? `${prefix}.${key}` : key;
    paths.push(next);
    const value = source[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      paths.push(...collectPaths(value, next));
    }
  }
  return paths;
}

function normalizeFormats(input) {
  const list = Array.isArray(input) ? input : [input];
  const parsed = list
    .flatMap((item) => String(item || "").split(","))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (parsed.length === 0) {
    return ["json"];
  }
  const unique = [...new Set(parsed)];
  for (const format of unique) {
    if (!SUPPORTED_FORMATS.has(format)) {
      throw new Error(`Formato de exportacao nao suportado: ${format}`);
    }
  }
  return unique;
}

function validateProfileSchema(profile) {
  const errors = [];
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return { valid: false, errors: ["Perfil invalido: estrutura raiz ausente."] };
  }
  for (const fieldPath of REQUIRED_PATHS) {
    if (getByPath(profile, fieldPath) === undefined) {
      errors.push(`Campo ausente no schema: ${fieldPath}`);
      if (errors.length >= 25) {
        break;
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

function toList(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return "-";
  }
  return (
    value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ") || "-"
  );
}

function renderSummary(profile, state = {}) {
  const identity = profile.identity || {};
  const professional = profile.professional || {};
  const synthesis = profile.synthesis || {};
  const completion = profile.meta?.completeness_score ?? 0;
  const phase = state.current_phase || "-";
  return [
    `Profile: ${profile.meta?.profile_id || "-"}`,
    `Phase: ${phase}`,
    `Completeness: ${completion}%`,
    `Name: ${identity.preferred_name || identity.full_name || "-"}`,
    `Current role: ${professional.current_role || "-"}`,
    `Core essence: ${synthesis.core_essence_paragraph || "-"}`,
    `Top values: ${toList(profile.values_and_beliefs?.hierarchy_of_values?.slice(0, 3))}`,
    `Growth edges: ${toList(synthesis.growth_edges)}`,
  ].join("\n");
}

function renderMarkdown(profile, state = {}) {
  const identity = profile.identity || {};
  const location = identity.location || {};
  const professional = profile.professional || {};
  const synthesis = profile.synthesis || {};
  const prediction = synthesis.prediction_patterns || {};
  return [
    `# MindClone Export - ${profile.meta?.profile_id || "unknown"}`,
    "",
    "## Snapshot",
    `- Current phase: ${state.current_phase || "-"}`,
    `- Overall progress: ${state.overall_progress ?? "-"}%`,
    `- Completeness score: ${profile.meta?.completeness_score ?? 0}%`,
    "",
    "## Identity",
    `- Name: ${identity.full_name || "-"}`,
    `- Preferred name: ${identity.preferred_name || "-"}`,
    `- Age: ${identity.age ?? "-"}`,
    `- Location: ${location.current_city || "-"}, ${location.current_country || "-"}`,
    "",
    "## Professional",
    `- Current role: ${professional.current_role || "-"}`,
    `- Industry: ${professional.industry || "-"}`,
    `- Career satisfaction: ${professional.career_satisfaction_level ?? "-"}/10`,
    `- Goal: ${professional.ambitions?.ultimate_professional_goal || "-"}`,
    "",
    "## Synthesis",
    `- Core essence: ${synthesis.core_essence_paragraph || "-"}`,
    `- In three words: ${toList(synthesis.in_three_words)}`,
    `- Unique combination: ${synthesis.unique_combination || "-"}`,
    `- Growth edges: ${toList(synthesis.growth_edges)}`,
    "",
    "## Prediction Patterns",
    `- Good news: ${prediction.how_they_would_react_to_good_news || "-"}`,
    `- Bad news: ${prediction.how_they_would_react_to_bad_news || "-"}`,
    `- Crisis: ${prediction.how_they_would_handle_a_crisis || "-"}`,
    "",
    "## RAG Instruction",
    synthesis.rag_instruction || "-",
  ].join("\n");
}

function chunkLine(id, section, text, meta = {}) {
  return JSON.stringify({
    id,
    section,
    text,
    meta,
  });
}

function renderRagChunks(profile) {
  const chunks = [];
  const profileId = profile.meta?.profile_id || "";
  chunks.push(
    chunkLine(
      "identity",
      "identity",
      `Nome: ${profile.identity?.full_name || "-"}. Preferido: ${profile.identity?.preferred_name || "-"}.`,
      {
        profile_id: profileId,
        source: "auto_relato",
      }
    )
  );
  chunks.push(
    chunkLine(
      "professional",
      "professional",
      `Papel atual: ${profile.professional?.current_role || "-"}. Objetivo: ${profile.professional?.ambitions?.ultimate_professional_goal || "-"}.`,
      {
        profile_id: profileId,
        source: "auto_relato",
      }
    )
  );
  chunks.push(
    chunkLine(
      "values",
      "values_and_beliefs",
      `Valores centrais: ${toList(profile.values_and_beliefs?.hierarchy_of_values?.slice(0, 5))}.`,
      {
        profile_id: profileId,
        source: "auto_relato",
      }
    )
  );
  chunks.push(
    chunkLine(
      "synthesis",
      "synthesis",
      `Essencia: ${profile.synthesis?.core_essence_paragraph || "-"}. RAG instruction: ${profile.synthesis?.rag_instruction || "-"}.`,
      {
        profile_id: profileId,
        source: "inferencia",
      }
    )
  );
  return `${chunks.join("\n")}\n`;
}

async function writeIfRequested(format, outputDir, profile, state, files) {
  if (format === "json") {
    const file = path.join(outputDir, "profile.json");
    await fs.writeFile(file, JSON.stringify(profile, null, 2), "utf8");
    files.json = file;
    return;
  }
  if (format === "markdown") {
    const file = path.join(outputDir, "profile.md");
    await fs.writeFile(file, renderMarkdown(profile, state), "utf8");
    files.markdown = file;
    return;
  }
  if (format === "summary") {
    const file = path.join(outputDir, "summary.txt");
    await fs.writeFile(file, renderSummary(profile, state), "utf8");
    files.summary = file;
    return;
  }
  if (format === "rag-chunks") {
    const file = path.join(outputDir, "rag-chunks.jsonl");
    await fs.writeFile(file, renderRagChunks(profile), "utf8");
    files["rag-chunks"] = file;
  }
}

async function exportProfileBundle({
  baseDir,
  profileId,
  profile,
  state = {},
  formats = ["json"],
}) {
  const schemaCheck = validateProfileSchema(profile);
  if (!schemaCheck.valid) {
    throw new Error(
      `Falha na validacao de schema antes do export: ${schemaCheck.errors.join(" | ")}`
    );
  }
  const selectedFormats = normalizeFormats(formats);
  const outputDir = path.join(baseDir, "exports", profileId);
  await fs.mkdir(outputDir, { recursive: true });
  const files = {};
  for (const format of selectedFormats) {
    await writeIfRequested(format, outputDir, profile, state, files);
  }
  return {
    outputDir,
    files,
  };
}

async function exportProfile(profileDir, profile, suffix = "partial") {
  const filename = `mind-profile-${suffix}.json`;
  const fullPath = path.join(profileDir, "exports", filename);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, JSON.stringify(profile, null, 2), "utf8");
  return fullPath;
}

module.exports = {
  exportProfile,
  exportProfileBundle,
  normalizeFormats,
  validateProfileSchema,
};
