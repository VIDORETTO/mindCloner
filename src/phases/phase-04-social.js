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

function parseYesNoScale(answer) {
  const normalized = answer.trim().toLowerCase();
  if (normalized.startsWith("sim") || normalized.startsWith("s")) {
    return 8;
  }
  if (normalized.startsWith("nao") || normalized.startsWith("não") || normalized.startsWith("n")) {
    return 2;
  }
  return parseScale(answer, 0, 10);
}

const PHASE_04 = {
  number: 4,
  id: "phase_04",
  name: "Dinamica Social",
  objective: "Entender como a pessoa se relaciona com outras pessoas em cenarios concretos.",
  rules: [
    "Usar cenarios especificos, nao abstratos",
    "Cruzar respostas com dados da Fase 1 sobre familia",
    'Usar perguntas de "sim ou nao" seguidas de "por que" quando fizer sentido',
  ],
  targetFields: [
    "social_dynamics.social_energy.social_battery_capacity",
    "social_dynamics.social_energy.introversion_extraversion_spectrum",
    "social_dynamics.social_energy.recharge_method",
    "social_dynamics.social_energy.ideal_social_frequency",
    "social_dynamics.communication_style.primary_style",
    "social_dynamics.communication_style.assertiveness_level",
    "social_dynamics.communication_style.directness",
    "social_dynamics.conflict_style.primary",
    "social_dynamics.conflict_style.anger_expression",
    "social_dynamics.trust_patterns.trust_speed",
    "social_dynamics.trust_patterns.trust_criteria",
    "social_dynamics.trust_patterns.vulnerability_comfort",
    "social_dynamics.social_perception.how_they_think_others_see_them",
    "social_dynamics.social_perception.how_they_want_to_be_seen",
    "social_dynamics.boundaries.setting_ability",
    "social_dynamics.boundaries.common_boundary_issues",
    "social_dynamics.relationship_patterns.family_relationships",
  ],
  completionThreshold: 1,
  opening: "Agora vamos mapear como voce funciona nas relacoes e em situacoes sociais.",
  transitionMessage:
    "Perfeito. Agora que entendi sua dinamica social, vamos para a Fase 5 sobre mapeamento de personalidade.",
  questions: [
    {
      id: "q01_social_energy",
      question:
        "Depois de uma festa ou evento social intenso, voce tende a ficar energizado ou drenado?",
      target_field: "social_dynamics.social_energy.social_battery_capacity",
      question_type: "scenario",
      mapper: (answer) => ({
        "social_dynamics.social_energy.social_battery_capacity": answer.trim(),
      }),
    },
    {
      id: "q02_introversion_spectrum",
      question:
        "Numa escala de 0 a 10, onde 0 e muito introvertido e 10 muito extrovertido, onde voce se coloca?",
      target_field: "social_dynamics.social_energy.introversion_extraversion_spectrum",
      question_type: "scale",
      mapper: (answer) => ({
        "social_dynamics.social_energy.introversion_extraversion_spectrum": parseScale(
          answer,
          0,
          10
        ),
      }),
    },
    {
      id: "q03_recharge_method",
      question: "Quando sua energia social acaba, o que voce faz para se recarregar?",
      target_field: "social_dynamics.social_energy.recharge_method",
      question_type: "open",
      mapper: (answer) => ({ "social_dynamics.social_energy.recharge_method": answer.trim() }),
    },
    {
      id: "q04_ideal_frequency",
      question: "Qual seria sua frequencia social ideal por semana para se sentir bem?",
      target_field: "social_dynamics.social_energy.ideal_social_frequency",
      question_type: "open",
      mapper: (answer) => ({
        "social_dynamics.social_energy.ideal_social_frequency": answer.trim(),
      }),
    },
    {
      id: "q05_communication_style",
      question: "Se um amigo faz algo que te incomoda, como voce aborda essa conversa na pratica?",
      target_field: "social_dynamics.communication_style.primary_style",
      question_type: "scenario",
      mapper: (answer) => ({ "social_dynamics.communication_style.primary_style": answer.trim() }),
    },
    {
      id: "q06_assertiveness",
      question: "Em conversas dificeis, quao assertivo(a) voce costuma ser numa escala de 0 a 10?",
      target_field: "social_dynamics.communication_style.assertiveness_level",
      question_type: "scale",
      mapper: (answer) => ({
        "social_dynamics.communication_style.assertiveness_level": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q07_directness",
      question:
        "Numa escala de 0 a 10, quao direto(a) voce costuma ser ao comunicar limites ou discordancias?",
      target_field: "social_dynamics.communication_style.directness",
      question_type: "scale",
      mapper: (answer) => ({
        "social_dynamics.communication_style.directness": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q08_conflict_style",
      question: "Num desentendimento com seu chefe ou lideranca, qual seria sua reacao imediata?",
      target_field: "social_dynamics.conflict_style.primary",
      question_type: "scenario",
      mapper: (answer) => ({ "social_dynamics.conflict_style.primary": answer.trim() }),
    },
    {
      id: "q09_anger_expression",
      question: "Quando voce fica irritado(a), como isso costuma aparecer nas suas interacoes?",
      target_field: "social_dynamics.conflict_style.anger_expression",
      question_type: "open",
      mapper: (answer) => ({ "social_dynamics.conflict_style.anger_expression": answer.trim() }),
    },
    {
      id: "q10_trust_speed",
      question: "Quanto tempo leva para voce confiar plenamente em alguem novo?",
      target_field: "social_dynamics.trust_patterns.trust_speed",
      question_type: "open",
      mapper: (answer) => ({ "social_dynamics.trust_patterns.trust_speed": answer.trim() }),
    },
    {
      id: "q11_trust_criteria",
      question: "Quais sinais fazem voce confiar em alguem? Separe por virgula.",
      target_field: "social_dynamics.trust_patterns.trust_criteria",
      question_type: "open",
      mapper: (answer) => ({ "social_dynamics.trust_patterns.trust_criteria": parseCsv(answer) }),
    },
    {
      id: "q12_vulnerability",
      question: "Numa escala de 0 a 10, quao confortavel voce se sente em mostrar vulnerabilidade?",
      target_field: "social_dynamics.trust_patterns.vulnerability_comfort",
      question_type: "scale",
      mapper: (answer) => ({
        "social_dynamics.trust_patterns.vulnerability_comfort": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q13_social_perception",
      question: "Como voce acha que as pessoas te descrevem em contextos sociais?",
      target_field: "social_dynamics.social_perception.how_they_think_others_see_them",
      question_type: "mirror",
      mapper: (answer) => ({
        "social_dynamics.social_perception.how_they_think_others_see_them": answer.trim(),
      }),
    },
    {
      id: "q14_desired_perception",
      question: "E como voce gostaria de ser percebido(a)?",
      target_field: "social_dynamics.social_perception.how_they_want_to_be_seen",
      question_type: "mirror",
      mapper: (answer) => ({
        "social_dynamics.social_perception.how_they_want_to_be_seen": answer.trim(),
      }),
    },
    {
      id: "q15_setting_boundaries",
      question: "Voce costuma dizer 'nao' com facilidade? Responda sim ou nao e explique por que.",
      target_field: "social_dynamics.boundaries.setting_ability",
      question_type: "yes-no-why",
      mapper: (answer) => ({
        "social_dynamics.boundaries.setting_ability": parseYesNoScale(answer),
      }),
    },
    {
      id: "q16_boundary_issues",
      question: "Quais situacoes mais desafiam seus limites pessoais? Separe por virgula.",
      target_field: "social_dynamics.boundaries.common_boundary_issues",
      question_type: "open",
      mapper: (answer) => ({
        "social_dynamics.boundaries.common_boundary_issues": parseCsv(answer),
      }),
    },
    {
      id: "q17_family_pattern",
      question: (profile) => {
        const maritalStatus = profile.identity?.family?.marital_status;
        if (maritalStatus) {
          return `Pensando na sua dinamica familiar atual (${maritalStatus}), qual padrao de relacionamento aparece com mais frequencia e por que?`;
        }
        return "Pensando na sua dinamica familiar, qual padrao de relacionamento aparece com mais frequencia e por que?";
      },
      target_field: "social_dynamics.relationship_patterns.family_relationships",
      question_type: "scenario",
      mapper: (answer) => ({
        "social_dynamics.relationship_patterns.family_relationships": answer.trim(),
      }),
    },
  ],
};

module.exports = {
  PHASE_04,
};
