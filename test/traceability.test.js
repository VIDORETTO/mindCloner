const test = require("node:test");
const assert = require("node:assert/strict");
const { createEmptyProfile } = require("../src/profile/profile-schema");
const { applyUpdates } = require("../src/profile/profile-builder");

test("Traceabilidade: fase 1 classifica como fato e atualiza confidence por bloco", () => {
  const profile = createEmptyProfile("trace-fact-a1");
  applyUpdates(
    profile,
    { "identity.full_name": "Joao Pedro da Silva" },
    {
      phaseNumber: 1,
      questionId: "q01_full_name",
      questionType: "open",
      targetField: "identity.full_name",
      answer: "Joao Pedro da Silva",
    }
  );

  const trace = profile.meta.data_lineage["identity.full_name"];
  assert.equal(trace.source_type, "fato");
  assert.equal(trace.confirmed, true);
  assert.equal(profile.meta.confidence_scores["identity.full_name"], 95);
  assert.equal(profile.meta.confidence_by_block.identity, 95);
});

test("Traceabilidade: prediction e registrada como inferencia nao confirmada", () => {
  const profile = createEmptyProfile("trace-inference-a1");
  applyUpdates(
    profile,
    {
      "synthesis.prediction_patterns.how_they_would_handle_a_crisis":
        "Priorizo, comunico riscos e assumo coordenacao com calma.",
    },
    {
      phaseNumber: 10,
      questionId: "q10_prediction_crisis",
      questionType: "prediction",
      targetField: "synthesis.prediction_patterns.how_they_would_handle_a_crisis",
      answer: "Priorizo, comunico riscos e assumo coordenacao com calma.",
    }
  );

  const trace =
    profile.meta.data_lineage["synthesis.prediction_patterns.how_they_would_handle_a_crisis"];
  assert.equal(trace.source_type, "inferencia");
  assert.equal(trace.confirmed, false);
  assert.equal(
    profile.meta.confidence_scores["synthesis.prediction_patterns.how_they_would_handle_a_crisis"],
    55
  );
});

test("Traceabilidade: resposta vazia com fallback e inferencia nao confirmada", () => {
  const profile = createEmptyProfile("trace-fallback-a1");
  applyUpdates(
    profile,
    {
      "synthesis.rag_instruction": "Voce esta representando Maria, Head de Produto.",
    },
    {
      phaseNumber: 10,
      questionId: "q14_rag_instruction",
      questionType: "validation",
      targetField: "synthesis.rag_instruction",
      answer: "",
    }
  );

  const trace = profile.meta.data_lineage["synthesis.rag_instruction"];
  assert.equal(trace.source_type, "inferencia");
  assert.equal(trace.confirmed, false);
});
