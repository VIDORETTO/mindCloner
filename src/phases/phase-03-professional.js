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

const PHASE_03 = {
  number: 3,
  id: "phase_03",
  name: "Perfil Profissional",
  objective: "Mapear carreira, habilidades, estilo de trabalho e ambicoes.",
  rules: [
    "Conectar informacoes factuais da Fase 1 com contexto de carreira",
    'Aprofundar com perguntas de "por que"',
    "Identificar motivacoes profissionais vs pessoais",
  ],
  targetFields: [
    "professional.current_role",
    "professional.industry",
    "professional.career_history",
    "professional.expertise_areas",
    "professional.skills.technical",
    "professional.skills.soft",
    "professional.work_style.collaboration_preference",
    "professional.work_style.preferred_environment",
    "professional.work_style.autonomy_need",
    "professional.professional_identity.what_defines_them_professionally",
    "professional.professional_identity.professional_values",
    "professional.ambitions.short_term",
    "professional.ambitions.ultimate_professional_goal",
    "professional.relationship_with_money.mindset",
    "professional.career_satisfaction_level",
    "professional.motivation_summary",
    "professional.ambitions.long_term",
  ],
  completionThreshold: 0.9,
  opening: "Agora vamos mapear seu perfil profissional em mais profundidade.",
  transitionMessage:
    "Perfeito. Agora que entendi seu perfil profissional, vamos para a Fase 4 sobre dinamica social.",
  questions: [
    {
      id: "q01_current_role",
      question: "O que voce faz profissionalmente hoje?",
      target_field: "professional.current_role",
      question_type: "open",
      mapper: (answer) => ({ "professional.current_role": answer.trim() }),
    },
    {
      id: "q02_industry",
      question: "Em qual setor ou industria voce atua atualmente?",
      target_field: "professional.industry",
      question_type: "open",
      mapper: (answer) => ({ "professional.industry": answer.trim() }),
    },
    {
      id: "q03_career_history",
      question:
        "Como voce chegou ate aqui na carreira? Liste marcos principais separados por virgula.",
      target_field: "professional.career_history",
      question_type: "open",
      mapper: (answer) => ({ "professional.career_history": parseCsv(answer) }),
    },
    {
      id: "q04_location_impact",
      question: (profile) => {
        const city = profile.identity?.location?.current_city;
        const country = profile.identity?.location?.current_country;
        if (city || country) {
          return `Voce mencionou que mora em ${[city, country].filter(Boolean).join(", ")}. Quais sao suas principais areas de atuacao ou expertise hoje, e por que esse contexto local influenciou isso? Separe por virgula.`;
        }
        return "Quais sao suas principais areas de atuacao ou expertise hoje e por que? Separe por virgula.";
      },
      target_field: "professional.expertise_areas",
      question_type: "open",
      mapper: (answer) => ({ "professional.expertise_areas": parseCsv(answer) }),
    },
    {
      id: "q05_technical_skills",
      question: "Quais sao suas principais habilidades tecnicas? Separe por virgula.",
      target_field: "professional.skills.technical",
      question_type: "open",
      mapper: (answer) => ({ "professional.skills.technical": parseCsv(answer) }),
    },
    {
      id: "q06_soft_skills",
      question: "Quais habilidades interpessoais mais te ajudam no trabalho? Separe por virgula.",
      target_field: "professional.skills.soft",
      question_type: "open",
      mapper: (answer) => ({ "professional.skills.soft": parseCsv(answer) }),
    },
    {
      id: "q07_collaboration_preference",
      question: "Voce prefere trabalhar sozinho, em dupla ou em equipe? Por que?",
      target_field: "professional.work_style.collaboration_preference",
      question_type: "open",
      mapper: (answer) => ({ "professional.work_style.collaboration_preference": answer.trim() }),
    },
    {
      id: "q08_preferred_environment",
      question: "Qual ambiente de trabalho te faz render melhor e por que?",
      target_field: "professional.work_style.preferred_environment",
      question_type: "open",
      mapper: (answer) => ({ "professional.work_style.preferred_environment": answer.trim() }),
    },
    {
      id: "q09_autonomy_need",
      question: "De 0 a 10, quanta autonomia voce precisa para trabalhar bem?",
      target_field: "professional.work_style.autonomy_need",
      question_type: "open",
      mapper: (answer) => ({ "professional.work_style.autonomy_need": parseScale(answer) }),
    },
    {
      id: "q10_professional_identity",
      question: "O que mais te define profissionalmente hoje e por que?",
      target_field: "professional.professional_identity.what_defines_them_professionally",
      question_type: "open",
      mapper: (answer) => ({
        "professional.professional_identity.what_defines_them_professionally": answer.trim(),
      }),
    },
    {
      id: "q11_professional_values",
      question: "Quais valores voce considera inegociaveis no trabalho? Separe por virgula.",
      target_field: "professional.professional_identity.professional_values",
      question_type: "open",
      mapper: (answer) => ({
        "professional.professional_identity.professional_values": parseCsv(answer),
      }),
    },
    {
      id: "q12_short_term_ambitions",
      question: "Quais sao suas ambicoes profissionais para os proximos 1-2 anos?",
      target_field: "professional.ambitions.short_term",
      question_type: "open",
      mapper: (answer) => ({ "professional.ambitions.short_term": parseCsv(answer) }),
    },
    {
      id: "q13_long_term_ambitions",
      question: "E para 5 anos ou mais, onde voce quer chegar profissionalmente?",
      target_field: "professional.ambitions.long_term",
      question_type: "open",
      mapper: (answer) => ({ "professional.ambitions.long_term": parseCsv(answer) }),
    },
    {
      id: "q14_ultimate_goal",
      question: "Qual e seu objetivo profissional final, se tudo der certo?",
      target_field: "professional.ambitions.ultimate_professional_goal",
      question_type: "open",
      mapper: (answer) => ({ "professional.ambitions.ultimate_professional_goal": answer.trim() }),
    },
    {
      id: "q15_money_relationship",
      question: "Como e sua relacao com dinheiro no contexto profissional?",
      target_field: "professional.relationship_with_money.mindset",
      question_type: "open",
      mapper: (answer) => ({ "professional.relationship_with_money.mindset": answer.trim() }),
    },
    {
      id: "q16_career_satisfaction",
      question: "Numa escala de 1 a 10, quao satisfeito voce esta com sua carreira hoje?",
      target_field: "professional.career_satisfaction_level",
      question_type: "open",
      mapper: (answer) => ({ "professional.career_satisfaction_level": parseScale(answer, 1, 10) }),
    },
    {
      id: "q17_motivation_summary",
      question:
        "No fim, o que pesa mais para voce na carreira: motivacoes profissionais ou pessoais? Por que?",
      target_field: "professional.motivation_summary",
      question_type: "open",
      mapper: (answer) => ({ "professional.motivation_summary": answer.trim() }),
    },
  ],
};

module.exports = {
  PHASE_03,
};
