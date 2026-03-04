function parseScale(answer, min = 0, max = 10) {
  const parsed = Number.parseInt(answer.replace(/[^\d]/g, ""), 10);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return Math.min(max, Math.max(min, parsed));
}

function parseChoice(answer, leftTerms = [], rightTerms = [], leftValue = 2, rightValue = 8) {
  const normalized = answer.trim().toLowerCase();
  if (rightTerms.some((term) => normalized.includes(term))) {
    return rightValue;
  }
  if (leftTerms.some((term) => normalized.includes(term))) {
    return leftValue;
  }
  return parseScale(answer, 0, 10);
}

function toEvidence(answer) {
  const trimmed = answer.trim();
  return trimmed ? [trimmed] : [];
}

function getProfessionalContext(profile) {
  const role = profile.professional?.current_role;
  if (role) {
    return `no seu contexto profissional (${role})`;
  }
  return "no seu contexto de trabalho";
}

function detectContradictions({ question, profile }) {
  const contradictions = [];
  if (question.target_field === "personality.big_five.conscientiousness.score") {
    const conscientiousness = profile.personality?.big_five?.conscientiousness?.score;
    const travelStyle = (profile.interests_and_preferences?.travel?.style || "").toLowerCase();
    const hasSpontaneity = /\bespont|\bimprovis|\bsem plano|\bsem roteiro|\bvai que vai/.test(
      travelStyle
    );
    if (conscientiousness != null && conscientiousness >= 8 && hasSpontaneity) {
      contradictions.push({
        contradiction:
          "Alta conscienciosidade vs preferencia declarada por espontaneidade em viagens.",
        explanation:
          "Fase 2 sugere espontaneidade (travel.style), enquanto Fase 5 indica alto planejamento.",
        fields: [
          "interests_and_preferences.travel.style",
          "personality.big_five.conscientiousness.score",
        ],
      });
    }
  }

  if (question.target_field === "personality.big_five.extraversion.score") {
    const extraversion = profile.personality?.big_five?.extraversion?.score;
    const socialSpectrum =
      profile.social_dynamics?.social_energy?.introversion_extraversion_spectrum;
    if (
      extraversion != null &&
      extraversion >= 8 &&
      socialSpectrum != null &&
      socialSpectrum <= 3
    ) {
      contradictions.push({
        contradiction: "Fase 4 indica introversao alta, mas Fase 5 aponta extroversao alta.",
        explanation:
          "A percepcao social previa foi mais introvertida, com resposta atual de alta necessidade de exposicao social.",
        fields: [
          "social_dynamics.social_energy.introversion_extraversion_spectrum",
          "personality.big_five.extraversion.score",
        ],
      });
    }
  }
  return contradictions;
}

const PHASE_05 = {
  number: 5,
  id: "phase_05",
  name: "Mapeamento de Personalidade",
  objective:
    "Mapear tracos de personalidade com avaliacao indireta por cenarios, incluindo Big Five, MBTI aproximado, eneagrama e temperamento.",
  rules: [
    'Nunca perguntar de forma direta "voce e introvertido(a)?"',
    "Usar cenarios concretos com polos contrastantes",
    "Cruzar respostas com fases anteriores e registrar possiveis contradicoes",
  ],
  targetFields: [
    "personality.big_five.openness.score",
    "personality.big_five.openness.evidence",
    "personality.big_five.conscientiousness.score",
    "personality.big_five.conscientiousness.evidence",
    "personality.big_five.extraversion.score",
    "personality.big_five.extraversion.evidence",
    "personality.big_five.agreeableness.score",
    "personality.big_five.agreeableness.evidence",
    "personality.big_five.neuroticism.score",
    "personality.big_five.neuroticism.evidence",
    "personality.mbti_approximation.type",
    "personality.mbti_approximation.confidence",
    "personality.enneagram_approximation.core_type",
    "personality.enneagram_approximation.wing",
    "personality.temperament.primary",
    "personality.temperament.secondary",
    "personality.cognitive_style.analytical_vs_intuitive",
    "personality.cognitive_style.detail_vs_big_picture",
    "personality.cognitive_style.sequential_vs_random",
    "personality.cognitive_style.convergent_vs_divergent",
    "personality.summary",
  ],
  completionThreshold: 0.9,
  opening: "Agora vamos mapear seus tracos de personalidade por cenarios do dia a dia.",
  transitionMessage:
    "Excelente. Com o mapeamento de personalidade concluido, vamos para a Fase 6 sobre paisagem emocional.",
  detectContradictions,
  questions: [
    {
      id: "q01_openness_scenario",
      question:
        "Voce prefere ferias com roteiro fechado ou sem plano para descobrir no caminho? Conte um exemplo recente.",
      target_field: "personality.big_five.openness.score",
      question_type: "scenario",
      mapper: (answer) => ({
        "personality.big_five.openness.score": parseChoice(
          answer,
          ["roteiro", "planejad", "fechado"],
          ["sem plano", "descobrir", "improvis"]
        ),
      }),
    },
    {
      id: "q02_openness_ideas",
      question:
        "Quando encontra uma ideia que contradiz o que voce acredita, sua primeira reacao tende a ser curiosidade ou desconforto? Por que?",
      target_field: "personality.big_five.openness.evidence",
      question_type: "scenario",
      mapper: (answer) => ({ "personality.big_five.openness.evidence": toEvidence(answer) }),
    },
    {
      id: "q03_conscientiousness_deadline",
      question:
        "Pensando em um prazo de duas semanas, quando voce costuma comecar e como organiza a execucao?",
      target_field: "personality.big_five.conscientiousness.score",
      question_type: "scenario",
      mapper: (answer) => ({
        "personality.big_five.conscientiousness.score": parseChoice(
          answer,
          ["ultimo dia", "ultima hora", "depois", "procrastin"],
          ["primeiro dia", "antes", "planej", "cronograma"]
        ),
      }),
    },
    {
      id: "q04_conscientiousness_order",
      question: (profile) =>
        `Em geral, ${getProfessionalContext(profile)}, seu espaco e processos tendem a ser organizados ou mais caoticos?`,
      target_field: "personality.big_five.conscientiousness.evidence",
      question_type: "scenario",
      mapper: (answer) => ({
        "personality.big_five.conscientiousness.evidence": toEvidence(answer),
      }),
    },
    {
      id: "q05_extraversion_meeting",
      question:
        "Numa reuniao com 10 pessoas sobre um tema novo, voce tende a falar cedo ou observar por um tempo antes?",
      target_field: "personality.big_five.extraversion.score",
      question_type: "scenario",
      mapper: (answer) => ({
        "personality.big_five.extraversion.score": parseChoice(
          answer,
          ["observ", "escut", "quiet"],
          ["fal", "pux", "frente"]
        ),
      }),
    },
    {
      id: "q06_extraversion_social_need",
      question:
        "Quantas interacoes sociais por semana voce sente que precisa para se manter energizado(a)?",
      target_field: "personality.big_five.extraversion.evidence",
      question_type: "scenario",
      mapper: (answer) => ({ "personality.big_five.extraversion.evidence": toEvidence(answer) }),
    },
    {
      id: "q07_agreeableness_disagreement",
      question:
        "Se voce discorda da maioria em um grupo, tende a expor sua opiniao logo ou prefere evitar atrito? Como decide?",
      target_field: "personality.big_five.agreeableness.score",
      question_type: "scenario",
      mapper: (answer) => ({
        "personality.big_five.agreeableness.score": parseChoice(
          answer,
          ["evit", "ced", "conflito"],
          ["expo", "sustent", "fal"]
        ),
      }),
    },
    {
      id: "q08_agreeableness_favor",
      question:
        "Quando alguem te pede um favor que te prejudica, o que voce costuma fazer na pratica?",
      target_field: "personality.big_five.agreeableness.evidence",
      question_type: "scenario",
      mapper: (answer) => ({ "personality.big_five.agreeableness.evidence": toEvidence(answer) }),
    },
    {
      id: "q09_neuroticism_worry",
      question:
        "Com que frequencia voce se preocupa com problemas que ainda nao aconteceram? Responda numa escala de 0 a 10 e contextualize.",
      target_field: "personality.big_five.neuroticism.score",
      question_type: "scenario",
      mapper: (answer) => ({
        "personality.big_five.neuroticism.score": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q10_neuroticism_recovery",
      question:
        "Quando algo da errado, quanto tempo leva para voce se recuperar emocionalmente e voltar ao ritmo?",
      target_field: "personality.big_five.neuroticism.evidence",
      question_type: "scenario",
      mapper: (answer) => ({ "personality.big_five.neuroticism.evidence": toEvidence(answer) }),
    },
    {
      id: "q11_mbti_type",
      question:
        "Se voce conhece MBTI, qual tipo te representa hoje (aproximadamente)? Se nao conhece, descreva como decide e se recarrega.",
      target_field: "personality.mbti_approximation.type",
      question_type: "open",
      mapper: (answer) => ({ "personality.mbti_approximation.type": answer.trim().toUpperCase() }),
    },
    {
      id: "q12_mbti_confidence",
      question:
        "Numa escala de 0 a 10, qual sua confianca nessa aproximacao de tipo? (0 = sem confianca, 10 = muito alta)",
      target_field: "personality.mbti_approximation.confidence",
      question_type: "scale",
      mapper: (answer) => ({
        "personality.mbti_approximation.confidence": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q13_enneagram_core",
      question:
        "Se voce conhece eneagrama, qual tipo central parece mais proximo de voce hoje? (1-9 ou descricao livre)",
      target_field: "personality.enneagram_approximation.core_type",
      question_type: "open",
      mapper: (answer) => {
        const parsed = parseScale(answer, 1, 9);
        return {
          "personality.enneagram_approximation.core_type": parsed,
        };
      },
    },
    {
      id: "q14_enneagram_wing",
      question:
        "E sobre asa (wing), existe uma tendencia secundaria que aparece junto? Responda com numero 1-9 ou texto curto.",
      target_field: "personality.enneagram_approximation.wing",
      question_type: "open",
      mapper: (answer) => {
        const parsed = parseScale(answer, 1, 9);
        return {
          "personality.enneagram_approximation.wing": parsed,
        };
      },
    },
    {
      id: "q15_temperament_primary",
      question:
        "Entre colerico, sanguineo, fleumatico e melancolico, qual temperamento parece mais dominante em voce?",
      target_field: "personality.temperament.primary",
      question_type: "open",
      mapper: (answer) => ({ "personality.temperament.primary": answer.trim() }),
    },
    {
      id: "q16_temperament_secondary",
      question: "Qual seria seu temperamento secundario, quando voce esta sob pressao ou cansaco?",
      target_field: "personality.temperament.secondary",
      question_type: "open",
      mapper: (answer) => ({ "personality.temperament.secondary": answer.trim() }),
    },
    {
      id: "q17_cognitive_analytical",
      question:
        "Num problema novo, voce tende a analisar dados antes (0) ou seguir intuicao inicial (10)?",
      target_field: "personality.cognitive_style.analytical_vs_intuitive",
      question_type: "scale",
      mapper: (answer) => ({
        "personality.cognitive_style.analytical_vs_intuitive": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q18_cognitive_detail",
      question:
        "Ao receber um projeto, voce foca primeiro em detalhes (0) ou no quadro geral (10)?",
      target_field: "personality.cognitive_style.detail_vs_big_picture",
      question_type: "scale",
      mapper: (answer) => ({
        "personality.cognitive_style.detail_vs_big_picture": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q19_cognitive_sequence",
      question:
        "No dia a dia, voce trabalha melhor com etapas sequenciais (0) ou pulando entre frentes (10)?",
      target_field: "personality.cognitive_style.sequential_vs_random",
      question_type: "scale",
      mapper: (answer) => ({
        "personality.cognitive_style.sequential_vs_random": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q20_cognitive_convergent",
      question:
        "Quando resolve problemas, tende a reduzir para uma resposta objetiva (0) ou gerar varias possibilidades antes (10)?",
      target_field: "personality.cognitive_style.convergent_vs_divergent",
      question_type: "scale",
      mapper: (answer) => ({
        "personality.cognitive_style.convergent_vs_divergent": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q21_personality_summary",
      question:
        "Com base no que conversamos, como voce resumiria seus principais tracos de personalidade em 2-3 linhas?",
      target_field: "personality.summary",
      question_type: "open",
      mapper: (answer) => ({ "personality.summary": answer.trim() }),
    },
  ],
};

module.exports = {
  PHASE_05,
};
