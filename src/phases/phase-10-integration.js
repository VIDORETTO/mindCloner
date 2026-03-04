const { getByPath } = require("../utils/object-path");

function parseCsv(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isFilled(value) {
  if (value == null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

const GAP_CANDIDATES = [
  {
    path: "identity.physical_self.self_description",
    label: "autodescricao fisica e presenca pessoal",
  },
  {
    path: "professional.professional_identity.dream_role",
    label: "papel profissional dos sonhos",
  },
  {
    path: "emotional_profile.attachment_style.secondary",
    label: "estilo de apego secundario",
  },
  {
    path: "values_and_beliefs.worldview.summary",
    label: "sintese da sua visao de mundo",
  },
  {
    path: "cognitive_patterns.learning.speed",
    label: "velocidade de aprendizado percebida",
  },
  {
    path: "self_concept.relationship_with_future_self",
    label: "relacao com seu eu do futuro",
  },
  {
    path: "life_narrative.life_philosophy_statement",
    label: "frase de filosofia de vida",
  },
];

function pickGap(profile) {
  return GAP_CANDIDATES.find((candidate) => !isFilled(getByPath(profile, candidate.path))) || null;
}

function getContradictionQuestion(profile, context = {}) {
  const list = Array.isArray(context.contradictions) ? context.contradictions : [];
  const open = list.find((item) => !item?.resolved) || list[0];
  if (open?.contradiction) {
    return `Na nossa conversa apareceu uma tensao: "${open.contradiction}". Como voce explicaria isso no seu contexto real?`;
  }

  const conscientiousness = profile.personality?.big_five?.conscientiousness?.score;
  const travelStyle = profile.interests_and_preferences?.travel?.style;
  if (conscientiousness != null && travelStyle) {
    return `Voce descreveu um estilo de viagem "${travelStyle}" e tambem trouxe sinais de planejamento alto. Como essas duas partes convivem em voce?`;
  }

  return "Qual contradicao interna voce mais percebe entre o que valoriza e o que faz na pratica?";
}

function getGapQuestion(profile) {
  const gap = pickGap(profile);
  if (!gap) {
    return "Quais lacunas do seu perfil ainda merecem mais detalhes para ficar fiel a quem voce e?";
  }
  return `Percebi que nao exploramos muito ${gap.label}. Pode me contar mais sobre isso?`;
}

function mapGapAnswer(answer, profile) {
  const trimmed = answer.trim();
  const gap = pickGap(profile);
  if (!gap) {
    return { "synthesis.blind_spots_identified": parseCsv(answer) };
  }
  return {
    "synthesis.blind_spots_identified": [gap.label],
    [gap.path]: trimmed,
  };
}

function buildDefaultRagInstruction(profile) {
  const preferredName =
    profile.identity?.preferred_name || profile.identity?.full_name || "a pessoa";
  const role = profile.professional?.current_role || "profissional";
  const values = profile.values_and_beliefs?.hierarchy_of_values?.slice(0, 3) || [];
  const valuesText = values.length > 0 ? values.join(", ") : "autenticidade e crescimento";
  const summary = profile.personality?.summary || profile.synthesis?.core_essence_paragraph || "";
  return `Voce esta representando ${preferredName}, ${role}. Priorize ${valuesText}. Tom de resposta: claro, humano e fiel ao historico. ${summary}`.trim();
}

function parseContradiction(answer, profile, context = {}) {
  const list = Array.isArray(context.contradictions) ? context.contradictions : [];
  const open = list.find((item) => !item?.resolved) || list[0];
  const contradictionText = open?.contradiction || "Contradicao mapeada em integracao final";
  return [
    {
      contradiction: contradictionText,
      explanation: answer.trim(),
    },
  ];
}

const PHASE_10 = {
  number: 10,
  id: "phase_10",
  name: "Integracao e Sintese",
  objective:
    "Cruzar todas as informacoes, resolver contradicoes, preencher lacunas e gerar uma sintese narrativa validada.",
  rules: [
    "Explorar contradicoes explicitamente antes de sintetizar o perfil",
    "Preencher lacunas remanescentes em qualquer secao relevante",
    "Validar inferencias e finalizar sintese util para RAG",
  ],
  targetFields: [
    "synthesis.key_contradictions",
    "synthesis.blind_spots_identified",
    "synthesis.growth_edges",
    "synthesis.core_essence_paragraph",
    "synthesis.in_three_words",
    "synthesis.unique_combination",
    "synthesis.primary_archetypes",
    "synthesis.prediction_patterns.how_they_would_react_to_good_news",
    "synthesis.prediction_patterns.how_they_would_react_to_bad_news",
    "synthesis.prediction_patterns.how_they_would_handle_a_crisis",
    "synthesis.prediction_patterns.how_they_would_celebrate",
    "synthesis.prediction_patterns.how_they_would_comfort_someone",
    "synthesis.prediction_patterns.how_they_would_make_a_big_decision",
    "synthesis.rag_instruction",
  ],
  completionThreshold: 1,
  opening:
    "Agora vamos integrar tudo que levantamos: contradicoes, lacunas e sintese final do seu perfil.",
  transitionMessage:
    "Sintese concluida. O perfil base foi finalizado e esta pronto para exportacao e deepening.",
  questions: [
    {
      id: "q01_contradiction_resolution",
      question: getContradictionQuestion,
      target_field: "synthesis.key_contradictions",
      question_type: "integration",
      mapper: (answer, profile, context) => ({
        "synthesis.key_contradictions": parseContradiction(answer, profile, context),
      }),
    },
    {
      id: "q02_gap_fill",
      question: getGapQuestion,
      target_field: "synthesis.blind_spots_identified",
      question_type: "gap-fill",
      mapper: (answer, profile) => mapGapAnswer(answer, profile),
    },
    {
      id: "q03_growth_edges",
      question:
        "Quais seriam seus principais pontos de desenvolvimento para os proximos 12 meses? Separe por virgula.",
      target_field: "synthesis.growth_edges",
      question_type: "integration",
      mapper: (answer) => ({ "synthesis.growth_edges": parseCsv(answer) }),
    },
    {
      id: "q04_core_essence",
      question:
        "Se eu tivesse que descrever voce em um paragrafo para quem nunca te conheceu, como voce gostaria que esse texto fosse?",
      target_field: "synthesis.core_essence_paragraph",
      question_type: "narrative",
      mapper: (answer) => ({ "synthesis.core_essence_paragraph": answer.trim() }),
    },
    {
      id: "q05_in_three_words",
      question: "Em tres palavras, como voce se define hoje? Separe por virgula.",
      target_field: "synthesis.in_three_words",
      question_type: "integration",
      mapper: (answer) => ({ "synthesis.in_three_words": parseCsv(answer).slice(0, 3) }),
    },
    {
      id: "q06_unique_combination",
      question:
        "Baseado em tudo, qual combinacao de tracos te torna unico(a)? Isso ressoa com sua autoimagem?",
      target_field: "synthesis.unique_combination",
      question_type: "validation",
      mapper: (answer) => ({ "synthesis.unique_combination": answer.trim() }),
    },
    {
      id: "q07_primary_archetypes",
      question:
        "Quais arquetipos (ex.: estrategista, cuidador, explorador) mais representam seu jeito de ser? Separe por virgula.",
      target_field: "synthesis.primary_archetypes",
      question_type: "integration",
      mapper: (answer) => ({ "synthesis.primary_archetypes": parseCsv(answer) }),
    },
    {
      id: "q08_prediction_good_news",
      question: "Como voce costuma reagir quando recebe uma boa noticia importante?",
      target_field: "synthesis.prediction_patterns.how_they_would_react_to_good_news",
      question_type: "prediction",
      mapper: (answer) => ({
        "synthesis.prediction_patterns.how_they_would_react_to_good_news": answer.trim(),
      }),
    },
    {
      id: "q09_prediction_bad_news",
      question:
        "E quando recebe uma noticia ruim inesperada, qual tende a ser sua resposta inicial?",
      target_field: "synthesis.prediction_patterns.how_they_would_react_to_bad_news",
      question_type: "prediction",
      mapper: (answer) => ({
        "synthesis.prediction_patterns.how_they_would_react_to_bad_news": answer.trim(),
      }),
    },
    {
      id: "q10_prediction_crisis",
      question: "Como voce costuma agir em uma crise real, com pressao alta?",
      target_field: "synthesis.prediction_patterns.how_they_would_handle_a_crisis",
      question_type: "prediction",
      mapper: (answer) => ({
        "synthesis.prediction_patterns.how_they_would_handle_a_crisis": answer.trim(),
      }),
    },
    {
      id: "q11_prediction_celebrate",
      question: "Como voce celebra conquistas importantes?",
      target_field: "synthesis.prediction_patterns.how_they_would_celebrate",
      question_type: "prediction",
      mapper: (answer) => ({
        "synthesis.prediction_patterns.how_they_would_celebrate": answer.trim(),
      }),
    },
    {
      id: "q12_prediction_comfort",
      question: "Quando alguem proximo precisa de conforto, como voce costuma apoiar?",
      target_field: "synthesis.prediction_patterns.how_they_would_comfort_someone",
      question_type: "prediction",
      mapper: (answer) => ({
        "synthesis.prediction_patterns.how_they_would_comfort_someone": answer.trim(),
      }),
    },
    {
      id: "q13_prediction_big_decision",
      question: "Qual e seu padrao mais comum ao tomar uma grande decisao de vida?",
      target_field: "synthesis.prediction_patterns.how_they_would_make_a_big_decision",
      question_type: "prediction",
      mapper: (answer) => ({
        "synthesis.prediction_patterns.how_they_would_make_a_big_decision": answer.trim(),
      }),
    },
    {
      id: "q14_rag_instruction",
      question:
        "Para uma IA te representar fielmente, quais instrucoes de comportamento e tom nao podem faltar?",
      target_field: "synthesis.rag_instruction",
      question_type: "validation",
      mapper: (answer, profile) => ({
        "synthesis.rag_instruction": answer.trim() || buildDefaultRagInstruction(profile),
      }),
    },
  ],
};

module.exports = {
  PHASE_10,
};
