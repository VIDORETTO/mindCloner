const test = require("node:test");
const assert = require("node:assert/strict");
const { validateQuestionCandidate } = require("../src/engine/question-validator");

test("QuestionValidator: bloqueia repeticao de pergunta", () => {
  const result = validateQuestionCandidate({
    questionText: "Qual e o seu nome completo?",
    targetField: "identity.full_name",
    askedQuestions: [{ question_text: "Qual e o seu nome completo?" }],
    phaseTargetFields: ["identity.full_name"],
    fallbackQuestion: "Qual e o seu nome completo?",
  });
  assert.equal(result.valid, false);
  assert(result.reasons.includes("repetition"));
});

test("QuestionValidator: bloqueia ambiguidade", () => {
  const result = validateQuestionCandidate({
    questionText: "Pode falar mais sobre isso?",
    targetField: "identity.full_name",
    askedQuestions: [],
    phaseTargetFields: ["identity.full_name"],
    fallbackQuestion: "Qual e o seu nome completo?",
  });
  assert.equal(result.valid, false);
  assert(result.reasons.includes("ambiguity"));
});

test("QuestionValidator: bloqueia baixa especificidade", () => {
  const result = validateQuestionCandidate({
    questionText: "Como foi?",
    targetField: "professional.current_role",
    askedQuestions: [],
    phaseTargetFields: ["professional.current_role"],
    fallbackQuestion: "Qual e seu papel atual no trabalho?",
  });
  assert.equal(result.valid, false);
  assert(result.reasons.includes("low_specificity"));
});

test("QuestionValidator: bloqueia campo alvo fora do schema", () => {
  const result = validateQuestionCandidate({
    questionText: "Qual e sua principal meta para este ano?",
    targetField: "foo.bar.baz",
    askedQuestions: [],
    phaseTargetFields: ["foo.bar.baz"],
    fallbackQuestion: "Qual e sua principal meta para este ano?",
  });
  assert.equal(result.valid, false);
  assert(result.reasons.includes("unmapped_target_field"));
});

test("QuestionValidator: permite follow-up mapeado mesmo sendo curto", () => {
  const result = validateQuestionCandidate({
    questionText: "Pode detalhar um pouco mais sua resposta?",
    targetField: "identity.full_name",
    questionType: "follow-up",
    askedQuestions: [],
    phaseTargetFields: ["identity.full_name"],
    fallbackQuestion: "Pode detalhar um pouco mais sua resposta?",
  });
  assert.equal(result.valid, true);
});
