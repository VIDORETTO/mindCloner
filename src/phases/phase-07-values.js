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

function parseCoreValues(answer) {
  const values = parseCsv(answer).slice(0, 5);
  if (values.length === 0) {
    const trimmed = answer.trim();
    if (!trimmed) {
      return [];
    }
    return [{ value: trimmed, importance: 10, why: "" }];
  }
  return values.map((value, index) => ({
    value,
    importance: Math.max(10 - index * 2, 1),
    why: "",
  }));
}

function getTeachingContext(profile) {
  const children = profile.identity?.family?.children;
  if (Array.isArray(children) && children.length > 0) {
    return "Se voce pudesse ensinar apenas 3 coisas aos seus filhos, quais seriam?";
  }
  return "Se voce pudesse ensinar apenas 3 coisas a uma crianca, quais seriam?";
}

function getEthicsContext(profile) {
  const professionalValues = profile.professional?.professional_identity?.professional_values || [];
  if (professionalValues.length > 0) {
    return `Pensando nos seus valores profissionais (${professionalValues.join(", ")}), voce mentiria para proteger alguem que ama? Em qual limite?`;
  }
  return "Voce mentiria para proteger alguem que ama? Em qual limite isso seria aceitavel para voce?";
}

const PHASE_07 = {
  number: 7,
  id: "phase_07",
  name: "Valores e Crencas",
  objective:
    "Mapear o sistema de valores, visao de mundo, etica, crencas e prioridades morais do usuario.",
  rules: [
    "Usar dilemas concretos e evitar perguntas abstratas sem contexto",
    "Priorizar hierarquia de valores com escolhas e trade-offs claros",
    "Cobrir explicitamente as 6 fundacoes morais da Moral Foundations Theory",
  ],
  targetFields: [
    "values_and_beliefs.core_values",
    "values_and_beliefs.hierarchy_of_values",
    "values_and_beliefs.worldview.summary",
    "values_and_beliefs.worldview.optimist_vs_pessimist",
    "values_and_beliefs.worldview.idealist_vs_realist",
    "values_and_beliefs.worldview.individualist_vs_collectivist",
    "values_and_beliefs.moral_foundations.care_harm",
    "values_and_beliefs.moral_foundations.fairness_cheating",
    "values_and_beliefs.moral_foundations.loyalty_betrayal",
    "values_and_beliefs.moral_foundations.authority_subversion",
    "values_and_beliefs.moral_foundations.sanctity_degradation",
    "values_and_beliefs.moral_foundations.liberty_oppression",
    "values_and_beliefs.ethical_framework",
    "values_and_beliefs.political_orientation.economic",
    "values_and_beliefs.political_orientation.social",
    "values_and_beliefs.political_orientation.summary",
    "values_and_beliefs.spiritual_religious.beliefs",
    "values_and_beliefs.spiritual_religious.practices",
    "values_and_beliefs.spiritual_religious.importance",
    "values_and_beliefs.philosophical_stances",
    "values_and_beliefs.non_negotiables",
    "values_and_beliefs.things_tolerated_but_disliked",
  ],
  completionThreshold: 1,
  opening: "Agora vamos mapear seus valores, crencas e principios morais.",
  transitionMessage:
    "Perfeito. Com seus valores e crencas mapeados, vamos para a Fase 8 sobre arquitetura cognitiva.",
  questions: [
    {
      id: "q01_core_values",
      question: (profile) => getTeachingContext(profile),
      target_field: "values_and_beliefs.core_values",
      question_type: "prioritization",
      mapper: (answer) => ({ "values_and_beliefs.core_values": parseCoreValues(answer) }),
    },
    {
      id: "q02_values_hierarchy",
      question:
        "Se precisasse ordenar seus valores principais do mais importante ao menos importante, qual seria essa ordem? Separe por virgula.",
      target_field: "values_and_beliefs.hierarchy_of_values",
      question_type: "prioritization",
      mapper: (answer) => ({ "values_and_beliefs.hierarchy_of_values": parseCsv(answer) }),
    },
    {
      id: "q03_worldview_summary",
      question: "Como voce resumiria sua visao de mundo hoje em 2-3 linhas?",
      target_field: "values_and_beliefs.worldview.summary",
      question_type: "open",
      mapper: (answer) => ({ "values_and_beliefs.worldview.summary": answer.trim() }),
    },
    {
      id: "q04_worldview_optimism",
      question:
        "Numa escala de 0 a 10, voce se considera mais pessimista (0) ou otimista (10) sobre o futuro das pessoas?",
      target_field: "values_and_beliefs.worldview.optimist_vs_pessimist",
      question_type: "scale",
      mapper: (answer) => ({
        "values_and_beliefs.worldview.optimist_vs_pessimist": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q05_worldview_idealism",
      question:
        "Numa escala de 0 a 10, voce tende mais ao realismo pragmatico (0) ou idealismo transformador (10)?",
      target_field: "values_and_beliefs.worldview.idealist_vs_realist",
      question_type: "scale",
      mapper: (answer) => ({
        "values_and_beliefs.worldview.idealist_vs_realist": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q06_worldview_individual_collective",
      question:
        "Em dilemas sociais, voce tende mais a priorizar autonomia individual (0) ou bem coletivo (10)?",
      target_field: "values_and_beliefs.worldview.individualist_vs_collectivist",
      question_type: "scale",
      mapper: (answer) => ({
        "values_and_beliefs.worldview.individualist_vs_collectivist": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q07_moral_care_harm",
      question:
        "Cenario: para evitar sofrimento imediato de uma pessoa, voce aceitaria quebrar uma regra menor? Escala 0-10 para peso de cuidado/dano.",
      target_field: "values_and_beliefs.moral_foundations.care_harm",
      question_type: "dilemma",
      mapper: (answer) => ({
        "values_and_beliefs.moral_foundations.care_harm": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q08_moral_fairness_cheating",
      question:
        "Cenario: se voce encontrasse uma carteira com dinheiro e identidade, o que faria? Escala 0-10 para peso de justica/trapaca.",
      target_field: "values_and_beliefs.moral_foundations.fairness_cheating",
      question_type: "dilemma",
      mapper: (answer) => ({
        "values_and_beliefs.moral_foundations.fairness_cheating": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q09_moral_loyalty_betrayal",
      question:
        "Cenario: se um amigo errar com alguem, voce protege o amigo ou expone o erro? Escala 0-10 para peso de lealdade/traicao.",
      target_field: "values_and_beliefs.moral_foundations.loyalty_betrayal",
      question_type: "dilemma",
      mapper: (answer) => ({
        "values_and_beliefs.moral_foundations.loyalty_betrayal": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q10_moral_authority_subversion",
      question:
        "Cenario: quando uma autoridade te da uma ordem que voce julga errada, como reage? Escala 0-10 para peso de autoridade/subversao.",
      target_field: "values_and_beliefs.moral_foundations.authority_subversion",
      question_type: "dilemma",
      mapper: (answer) => ({
        "values_and_beliefs.moral_foundations.authority_subversion": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q11_moral_sanctity_degradation",
      question:
        "Cenario: ha algo que voce considera moralmente inaceitavel mesmo sem dano direto a terceiros? Escala 0-10 para santidade/degradacao.",
      target_field: "values_and_beliefs.moral_foundations.sanctity_degradation",
      question_type: "dilemma",
      mapper: (answer) => ({
        "values_and_beliefs.moral_foundations.sanctity_degradation": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q12_moral_liberty_oppression",
      question:
        "Cenario: ate que ponto o Estado ou instituicoes deveriam limitar escolhas individuais para proteger a coletividade? Escala 0-10 para liberdade/opressao.",
      target_field: "values_and_beliefs.moral_foundations.liberty_oppression",
      question_type: "dilemma",
      mapper: (answer) => ({
        "values_and_beliefs.moral_foundations.liberty_oppression": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q13_ethical_framework",
      question: (profile) => getEthicsContext(profile),
      target_field: "values_and_beliefs.ethical_framework",
      question_type: "ethics",
      mapper: (answer) => ({ "values_and_beliefs.ethical_framework": answer.trim() }),
    },
    {
      id: "q14_political_economic",
      question:
        "Em economia, voce tende mais a defender livre mercado, intervencao estatal ou um equilibrio entre os dois?",
      target_field: "values_and_beliefs.political_orientation.economic",
      question_type: "scale",
      mapper: (answer) => ({ "values_and_beliefs.political_orientation.economic": answer.trim() }),
    },
    {
      id: "q15_political_social",
      question:
        "Em pautas sociais, voce se considera mais progressista, conservador(a) ou contextual?",
      target_field: "values_and_beliefs.political_orientation.social",
      question_type: "scale",
      mapper: (answer) => ({ "values_and_beliefs.political_orientation.social": answer.trim() }),
    },
    {
      id: "q16_political_summary",
      question:
        "Sem rotulos, como voce resumiria sua orientacao politica geral e os principios que a sustentam?",
      target_field: "values_and_beliefs.political_orientation.summary",
      question_type: "open",
      mapper: (answer) => ({ "values_and_beliefs.political_orientation.summary": answer.trim() }),
    },
    {
      id: "q17_spiritual_beliefs",
      question: "Qual e sua relacao com espiritualidade, religiao ou transcendencia?",
      target_field: "values_and_beliefs.spiritual_religious.beliefs",
      question_type: "open",
      mapper: (answer) => ({ "values_and_beliefs.spiritual_religious.beliefs": answer.trim() }),
    },
    {
      id: "q18_spiritual_practices",
      question: "Existe alguma pratica espiritual ou ritual que voce mantem com frequencia?",
      target_field: "values_and_beliefs.spiritual_religious.practices",
      question_type: "open",
      mapper: (answer) => ({ "values_and_beliefs.spiritual_religious.practices": answer.trim() }),
    },
    {
      id: "q19_spiritual_importance",
      question:
        "Em uma escala de 0 a 10, qual a importancia de espiritualidade/religiao na sua vida?",
      target_field: "values_and_beliefs.spiritual_religious.importance",
      question_type: "scale",
      mapper: (answer) => ({
        "values_and_beliefs.spiritual_religious.importance": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q20_philosophical_stances",
      question:
        "Quais correntes ou ideias filosoficas mais influenciam suas decisoes? Separe por virgula.",
      target_field: "values_and_beliefs.philosophical_stances",
      question_type: "open",
      mapper: (answer) => ({ "values_and_beliefs.philosophical_stances": parseCsv(answer) }),
    },
    {
      id: "q21_non_negotiables",
      question:
        "Quais principios sao inegociaveis para voce em relacoes e decisoes? Separe por virgula.",
      target_field: "values_and_beliefs.non_negotiables",
      question_type: "prioritization",
      mapper: (answer) => ({ "values_and_beliefs.non_negotiables": parseCsv(answer) }),
    },
    {
      id: "q22_tolerated_disliked",
      question:
        "Que coisas voce tolera no dia a dia, mas no fundo desaprova ou nao gosta? Separe por virgula.",
      target_field: "values_and_beliefs.things_tolerated_but_disliked",
      question_type: "open",
      mapper: (answer) => ({
        "values_and_beliefs.things_tolerated_but_disliked": parseCsv(answer),
      }),
    },
  ],
};

module.exports = {
  PHASE_07,
};
