function parseCsv(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseScale(answer, min = 0, max = 10) {
  const parsed = Number.parseInt(answer.replace(/[^\d]/g, ""), 10);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return Math.min(max, Math.max(min, parsed));
}

function parseBoolean(answer) {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  if (["sim", "yes", "y", "true", "1", "frequentemente", "muito"].includes(normalized)) {
    return true;
  }
  if (["nao", "não", "no", "n", "false", "0", "nunca", "raramente"].includes(normalized)) {
    return false;
  }
  return normalized.includes("sim") || normalized.includes("frequente");
}

function parseBiases(answer) {
  const chunks = answer
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  if (chunks.length === 0) {
    return [];
  }

  return chunks.map((chunk) => {
    const [bias = "", frequency = "", context = ""] = chunk.split("|").map((item) => item.trim());
    return {
      bias,
      frequency,
      context,
    };
  });
}

function getDecisionScenario(profile) {
  const dreamRole = profile.professional?.professional_identity?.dream_role;
  if (dreamRole) {
    return `Cenario: voce recebe 2 propostas, uma com salario maior e outra mais alinhada ao seu objetivo de ${dreamRole}. Como decide?`;
  }
  return "Cenario: voce precisa escolher entre 2 empregos, um paga mais e o outro tem mais significado. Como decide?";
}

const PHASE_08 = {
  number: 8,
  id: "phase_08",
  name: "Arquitetura Cognitiva",
  objective:
    "Mapear como o usuario pensa, decide, resolve problemas, aprende, monitora vieses e regula foco.",
  rules: [
    "Usar cenarios concretos para avaliar funcoes executivas e tomada de decisao",
    "Cobrir metacognicao, heuristicas e padroes de pensamento sem rotulos prematuros",
    "Equilibrar perguntas de escala com exemplos praticos para validar consistencia",
  ],
  targetFields: [
    "cognitive_patterns.decision_making.style",
    "cognitive_patterns.decision_making.factors_prioritized",
    "cognitive_patterns.decision_making.analysis_paralysis_prone",
    "cognitive_patterns.decision_making.gut_vs_data",
    "cognitive_patterns.decision_making.regret_pattern",
    "cognitive_patterns.problem_solving.approach",
    "cognitive_patterns.problem_solving.persistence_level",
    "cognitive_patterns.problem_solving.asks_for_help_when",
    "cognitive_patterns.problem_solving.preferred_tools",
    "cognitive_patterns.learning.style",
    "cognitive_patterns.learning.preferred_formats",
    "cognitive_patterns.learning.retention_strengths",
    "cognitive_patterns.learning.motivation_to_learn",
    "cognitive_patterns.cognitive_biases_prone",
    "cognitive_patterns.attention_patterns.focus_duration",
    "cognitive_patterns.attention_patterns.distraction_triggers",
    "cognitive_patterns.attention_patterns.flow_state_triggers",
    "cognitive_patterns.thinking_patterns.inner_monologue",
    "cognitive_patterns.thinking_patterns.rumination_tendency",
    "cognitive_patterns.creativity.level",
    "cognitive_patterns.creativity.creative_process",
    "cognitive_patterns.risk_tolerance.financial",
    "cognitive_patterns.risk_tolerance.social",
    "cognitive_patterns.risk_tolerance.professional",
  ],
  completionThreshold: 1,
  opening:
    "Agora vamos mapear sua arquitetura cognitiva: como voce decide, aprende e resolve problemas.",
  transitionMessage:
    "Excelente. Com sua arquitetura cognitiva mapeada, vamos para a Fase 9 sobre psicologia profunda.",
  questions: [
    {
      id: "q01_decision_style",
      question: (profile) => getDecisionScenario(profile),
      target_field: "cognitive_patterns.decision_making.style",
      question_type: "scenario",
      mapper: (answer) => ({ "cognitive_patterns.decision_making.style": answer.trim() }),
    },
    {
      id: "q03_decision_factors",
      question: "Quais fatores voce prioriza para decidir? Separe por virgula.",
      target_field: "cognitive_patterns.decision_making.factors_prioritized",
      question_type: "prioritization",
      mapper: (answer) => ({
        "cognitive_patterns.decision_making.factors_prioritized": parseCsv(answer),
      }),
    },
    {
      id: "q04_analysis_paralysis",
      question: "Voce entra em paralisia por analise com frequencia? (sim/nao)",
      target_field: "cognitive_patterns.decision_making.analysis_paralysis_prone",
      question_type: "open",
      mapper: (answer) => ({
        "cognitive_patterns.decision_making.analysis_paralysis_prone": parseBoolean(answer),
      }),
    },
    {
      id: "q05_gut_vs_data",
      question: "Em escala 0-10, voce decide mais por intuicao (0) ou por dados e evidencias (10)?",
      target_field: "cognitive_patterns.decision_making.gut_vs_data",
      question_type: "scale",
      mapper: (answer) => ({
        "cognitive_patterns.decision_making.gut_vs_data": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q06_regret_pattern",
      question: "Quando se arrepende de uma decisao, qual padrao costuma se repetir?",
      target_field: "cognitive_patterns.decision_making.regret_pattern",
      question_type: "reflection",
      mapper: (answer) => ({ "cognitive_patterns.decision_making.regret_pattern": answer.trim() }),
    },
    {
      id: "q07_problem_approach",
      question: "Descreva seu processo para atacar um problema complexo e novo.",
      target_field: "cognitive_patterns.problem_solving.approach",
      question_type: "process",
      mapper: (answer) => ({ "cognitive_patterns.problem_solving.approach": answer.trim() }),
    },
    {
      id: "q09_problem_persistence",
      question: "Em escala 0-10, qual seu nivel de persistencia diante de bloqueios longos?",
      target_field: "cognitive_patterns.problem_solving.persistence_level",
      question_type: "scale",
      mapper: (answer) => ({
        "cognitive_patterns.problem_solving.persistence_level": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q10_help_threshold",
      question: "Em que ponto voce decide pedir ajuda para resolver um problema?",
      target_field: "cognitive_patterns.problem_solving.asks_for_help_when",
      question_type: "reflection",
      mapper: (answer) => ({
        "cognitive_patterns.problem_solving.asks_for_help_when": answer.trim(),
      }),
    },
    {
      id: "q11_preferred_tools",
      question:
        "Quais ferramentas mentais ou praticas voce usa para resolver problemas? Separe por virgula.",
      target_field: "cognitive_patterns.problem_solving.preferred_tools",
      question_type: "open",
      mapper: (answer) => ({
        "cognitive_patterns.problem_solving.preferred_tools": parseCsv(answer),
      }),
    },
    {
      id: "q12_learning_style",
      question: "Como voce aprende melhor na pratica?",
      target_field: "cognitive_patterns.learning.style",
      question_type: "reflection",
      mapper: (answer) => ({ "cognitive_patterns.learning.style": answer.trim() }),
    },
    {
      id: "q14_learning_formats",
      question: "Quais formatos de aprendizado funcionam melhor para voce? Separe por virgula.",
      target_field: "cognitive_patterns.learning.preferred_formats",
      question_type: "open",
      mapper: (answer) => ({ "cognitive_patterns.learning.preferred_formats": parseCsv(answer) }),
    },
    {
      id: "q15_retention_strengths",
      question: "O que ajuda voce a reter conhecimento por mais tempo?",
      target_field: "cognitive_patterns.learning.retention_strengths",
      question_type: "reflection",
      mapper: (answer) => ({ "cognitive_patterns.learning.retention_strengths": answer.trim() }),
    },
    {
      id: "q16_motivation_to_learn",
      question: "O que mais te motiva a aprender algo novo em fases de rotina puxada?",
      target_field: "cognitive_patterns.learning.motivation_to_learn",
      question_type: "reflection",
      mapper: (answer) => ({ "cognitive_patterns.learning.motivation_to_learn": answer.trim() }),
    },
    {
      id: "q17_biases",
      question:
        "Quais vieses cognitivos voce percebe em si? Use formato vies|frequencia|contexto e separe itens por ';'.",
      target_field: "cognitive_patterns.cognitive_biases_prone",
      question_type: "open",
      mapper: (answer) => ({ "cognitive_patterns.cognitive_biases_prone": parseBiases(answer) }),
    },
    {
      id: "q18_focus_duration",
      question: "Quanto tempo voce consegue manter foco profundo sem se distrair?",
      target_field: "cognitive_patterns.attention_patterns.focus_duration",
      question_type: "open",
      mapper: (answer) => ({
        "cognitive_patterns.attention_patterns.focus_duration": answer.trim(),
      }),
    },
    {
      id: "q20_distraction_triggers",
      question: "Quais gatilhos te distraem com mais frequencia? Separe por virgula.",
      target_field: "cognitive_patterns.attention_patterns.distraction_triggers",
      question_type: "open",
      mapper: (answer) => ({
        "cognitive_patterns.attention_patterns.distraction_triggers": parseCsv(answer),
      }),
    },
    {
      id: "q21_flow_triggers",
      question: "O que geralmente aciona seu estado de flow? Separe por virgula.",
      target_field: "cognitive_patterns.attention_patterns.flow_state_triggers",
      question_type: "open",
      mapper: (answer) => ({
        "cognitive_patterns.attention_patterns.flow_state_triggers": parseCsv(answer),
      }),
    },
    {
      id: "q22_inner_monologue",
      question:
        "Como seu dialogo interno costuma aparecer quando voce esta decidindo algo importante?",
      target_field: "cognitive_patterns.thinking_patterns.inner_monologue",
      question_type: "reflection",
      mapper: (answer) => ({
        "cognitive_patterns.thinking_patterns.inner_monologue": answer.trim(),
      }),
    },
    {
      id: "q23_rumination",
      question:
        "Em escala 0-10, qual sua tendencia a ruminar pensamentos apos eventos estressantes?",
      target_field: "cognitive_patterns.thinking_patterns.rumination_tendency",
      question_type: "scale",
      mapper: (answer) => ({
        "cognitive_patterns.thinking_patterns.rumination_tendency": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q25_creativity_level",
      question: "Em escala 0-10, como voce avalia seu nivel geral de criatividade aplicada?",
      target_field: "cognitive_patterns.creativity.level",
      question_type: "scale",
      mapper: (answer) => ({ "cognitive_patterns.creativity.level": parseScale(answer, 0, 10) }),
    },
    {
      id: "q26_creativity_process",
      question: "Quando recebe um problema inusitado, como seu processo criativo acontece?",
      target_field: "cognitive_patterns.creativity.creative_process",
      question_type: "task",
      mapper: (answer) => ({ "cognitive_patterns.creativity.creative_process": answer.trim() }),
    },
    {
      id: "q27_risk_financial",
      question:
        "Em escala 0-10, qual sua tolerancia a risco financeiro (0 = extremamente conservador, 10 = muito arrojado)?",
      target_field: "cognitive_patterns.risk_tolerance.financial",
      question_type: "scenario",
      mapper: (answer) => ({
        "cognitive_patterns.risk_tolerance.financial": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q28_risk_social",
      question:
        "Em escala 0-10, qual sua tolerancia a risco social (discordar publicamente, se expor, etc.)?",
      target_field: "cognitive_patterns.risk_tolerance.social",
      question_type: "scale",
      mapper: (answer) => ({
        "cognitive_patterns.risk_tolerance.social": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q29_risk_professional",
      question:
        "Em escala 0-10, qual sua tolerancia a risco profissional (mudanca de area, aposta de carreira)?",
      target_field: "cognitive_patterns.risk_tolerance.professional",
      question_type: "scale",
      mapper: (answer) => ({
        "cognitive_patterns.risk_tolerance.professional": parseScale(answer, 0, 10),
      }),
    },
  ],
};

module.exports = {
  PHASE_08,
};
