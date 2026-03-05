const test = require("node:test");
const assert = require("node:assert/strict");
const { createEmptyProfile } = require("../src/profile/profile-schema");
const { buildContextPack } = require("../src/profile/context-pack-exporter");

test("ContextPackExporter: monta resumo para IA com campos principais", () => {
  const profile = createEmptyProfile("context-pack-a1");
  profile.identity.preferred_name = "Helena";
  profile.professional.current_role = "Tech Lead";
  profile.personality.summary = "Direta, curiosa e orientada a resultados.";
  profile.values_and_beliefs.hierarchy_of_values = ["Autonomia", "Impacto", "Aprendizado"];
  profile.synthesis.core_essence_paragraph = "Lidera com clareza e alta responsabilidade.";
  profile.synthesis.unique_combination = "Visao de produto com execucao tecnica.";
  profile.synthesis.rag_instruction = "Responder com contexto real e sem suposicoes.";
  profile.synthesis.communication_dna = ["Objetiva"];
  profile.synthesis.growth_edges = ["Delegar mais cedo"];
  profile.meta.completeness_score = 81.5;

  const text = buildContextPack(profile, {
    current_phase: 7,
    overall_progress: 68,
    detected_contradictions: ["A", "B"],
  });

  assert.match(text, /Resumo para IA/);
  assert.match(text, /Helena/);
  assert.match(text, /Tech Lead/);
  assert.match(text, /Contradicoes abertas: 2/);
  assert.match(text, /Completude: 81.50%/);
});
