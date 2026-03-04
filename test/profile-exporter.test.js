const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { createEmptyProfile } = require("../src/profile/profile-schema");
const {
  exportProfileBundle,
  normalizeFormats,
  validateProfileSchema,
} = require("../src/profile/profile-exporter");

test("ProfileExporter: normaliza formatos e rejeita formato invalido", () => {
  assert.deepEqual(normalizeFormats("json, markdown,summary"), ["json", "markdown", "summary"]);
  assert.throws(() => normalizeFormats("json,xml"), /nao suportado/i);
});

test("ProfileExporter: valida schema do perfil", () => {
  const okProfile = createEmptyProfile("export-schema-ok");
  const ok = validateProfileSchema(okProfile);
  assert.equal(ok.valid, true);

  const badProfile = createEmptyProfile("export-schema-bad");
  delete badProfile.synthesis;
  const bad = validateProfileSchema(badProfile);
  assert.equal(bad.valid, false);
  assert.match(bad.errors[0], /Campo ausente no schema/i);
});

test("ProfileExporter: gera json, markdown, summary e rag-chunks em exports/<userId>/", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mindclone-export-"));
  const profile = createEmptyProfile("export-prof-v1");
  profile.identity.full_name = "Maria Lima";
  profile.identity.preferred_name = "Maria";
  profile.professional.current_role = "Head de Produto";
  profile.synthesis.core_essence_paragraph = "Estrategica, humana e orientada a impacto.";
  profile.synthesis.growth_edges = ["Delegar cedo", "Pausar antes de decidir"];
  profile.synthesis.rag_instruction = "Responda com clareza e empatia.";
  profile.meta.completeness_score = 88.7;

  const result = await exportProfileBundle({
    baseDir: tmpRoot,
    profileId: "export-prof-v1",
    profile,
    state: { current_phase: 10, overall_progress: 100 },
    formats: ["json", "markdown", "summary", "rag-chunks"],
  });

  assert.match(result.outputDir, /exports[\\/]export-prof-v1$/);
  assert.equal(Object.keys(result.files).length, 4);

  const jsonRaw = JSON.parse(await fs.readFile(result.files.json, "utf8"));
  const mdRaw = await fs.readFile(result.files.markdown, "utf8");
  const summaryRaw = await fs.readFile(result.files.summary, "utf8");
  const ragRaw = await fs.readFile(result.files["rag-chunks"], "utf8");

  assert.equal(jsonRaw.identity.preferred_name, "Maria");
  assert.match(mdRaw, /# MindClone Export/);
  assert.match(summaryRaw, /Completeness: 88.7%/);
  assert.equal(ragRaw.trim().split("\n").length >= 4, true);
});
