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

function parseAttachmentStyle(answer) {
  const normalized = answer.trim().toLowerCase();
  if (normalized.includes("segur")) {
    return "seguro";
  }
  if (normalized.includes("ansio")) {
    return "ansioso";
  }
  if (normalized.includes("evita")) {
    return "evitativo";
  }
  if (normalized.includes("desorg")) {
    return "desorganizado";
  }
  return answer.trim();
}

function parseDefenseMechanisms(answer) {
  const normalized = answer.trim().toLowerCase();
  const detected = [];

  if (normalized.includes("proje")) {
    detected.push("projecao");
  }
  if (normalized.includes("racional")) {
    detected.push("racionalizacao");
  }
  if (normalized.includes("nega")) {
    detected.push("negacao");
  }
  if (normalized.includes("humor")) {
    detected.push("humor");
  }
  if (normalized.includes("sublim")) {
    detected.push("sublimacao");
  }

  if (detected.length > 0) {
    return detected;
  }
  return parseCsv(answer);
}

function toEvidence(answer) {
  const trimmed = answer.trim();
  return trimmed ? [trimmed] : [];
}

function toTriggerEntry(answer) {
  const trimmed = answer.trim();
  if (!trimmed) {
    return [];
  }
  return [
    {
      trigger: trimmed,
      emotional_response: "",
      intensity: null,
      typical_behavior: "",
      recovery_time: "",
    },
  ];
}

function getRelationshipContext(profile) {
  const maritalStatus = profile.identity?.family?.marital_status;
  if (maritalStatus) {
    return `Considerando sua relacao ${maritalStatus.toLowerCase()}, como voce reage quando percebe distancia emocional da outra pessoa?`;
  }
  return "Quando voce percebe distancia emocional de alguem importante, como costuma reagir?";
}

function getAuthorityContext(profile) {
  const role = profile.professional?.current_role;
  if (role) {
    return `Quando uma lideranca no seu contexto profissional (${role}) te critica, qual sua resposta emocional automatica?`;
  }
  return "Quando uma figura de autoridade te critica, qual sua resposta emocional automatica?";
}

const PHASE_06 = {
  number: 6,
  id: "phase_06",
  name: "Paisagem Emocional",
  objective:
    "Mapear padroes emocionais, triggers, mecanismos de defesa, estilo de apego e estrategias de regulacao.",
  rules: [
    "Priorizar cenarios concretos para mapear emocao em contexto real",
    "Investigar apego por historias e exemplos, sem rotular cedo demais",
    "Diferenciar coping saudavel, coping disfuncional e reacao automatica",
  ],
  targetFields: [
    "emotional_profile.emotional_baseline.default_mood",
    "emotional_profile.emotional_baseline.emotional_range",
    "emotional_profile.emotional_baseline.emotional_intensity",
    "emotional_profile.emotional_baseline.emotional_stability",
    "emotional_profile.emotional_intelligence.self_awareness",
    "emotional_profile.emotional_intelligence.self_regulation",
    "emotional_profile.emotional_intelligence.empathy",
    "emotional_profile.emotional_intelligence.social_skills",
    "emotional_profile.attachment_style.primary",
    "emotional_profile.attachment_style.in_romantic_relationships",
    "emotional_profile.attachment_style.in_friendships",
    "emotional_profile.attachment_style.with_authority",
    "emotional_profile.attachment_style.evidence",
    "emotional_profile.emotional_triggers",
    "emotional_profile.coping_mechanisms.healthy",
    "emotional_profile.coping_mechanisms.unhealthy",
    "emotional_profile.coping_mechanisms.primary_defense_mechanisms",
    "emotional_profile.coping_mechanisms.under_stress",
    "emotional_profile.coping_mechanisms.under_conflict",
    "emotional_profile.coping_mechanisms.under_pressure",
    "emotional_profile.emotional_needs",
    "emotional_profile.emotional_expression_style",
  ],
  completionThreshold: 1,
  opening: "Agora vamos mapear sua paisagem emocional em diferentes contextos.",
  transitionMessage:
    "Excelente. Com sua paisagem emocional mapeada, vamos para a Fase 7 sobre valores e crencas.",
  questions: [
    {
      id: "q01_default_mood",
      question: "No geral, como voce descreveria seu estado emocional medio no dia a dia?",
      target_field: "emotional_profile.emotional_baseline.default_mood",
      question_type: "baseline",
      mapper: (answer) => ({ "emotional_profile.emotional_baseline.default_mood": answer.trim() }),
    },
    {
      id: "q02_emotional_range",
      question:
        "Sua variacao emocional tende a ser ampla (muda bastante) ou mais estreita (mais constante)? Explique.",
      target_field: "emotional_profile.emotional_baseline.emotional_range",
      question_type: "baseline",
      mapper: (answer) => ({
        "emotional_profile.emotional_baseline.emotional_range": answer.trim(),
      }),
    },
    {
      id: "q03_emotional_intensity",
      question: "Numa escala de 0 a 10, qual costuma ser a intensidade media das suas emocoes?",
      target_field: "emotional_profile.emotional_baseline.emotional_intensity",
      question_type: "scale",
      mapper: (answer) => ({
        "emotional_profile.emotional_baseline.emotional_intensity": answer.trim(),
      }),
    },
    {
      id: "q04_emotional_stability",
      question:
        "Quando ocorre um imprevisto, sua estabilidade emocional costuma se manter ou oscilar rapido?",
      target_field: "emotional_profile.emotional_baseline.emotional_stability",
      question_type: "scenario",
      mapper: (answer) => ({
        "emotional_profile.emotional_baseline.emotional_stability": answer.trim(),
      }),
    },
    {
      id: "q05_self_awareness",
      question:
        "Em uma escala de 0 a 10, quao cedo voce percebe o que esta sentindo antes de reagir?",
      target_field: "emotional_profile.emotional_intelligence.self_awareness",
      question_type: "scale",
      mapper: (answer) => ({
        "emotional_profile.emotional_intelligence.self_awareness": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q06_self_regulation",
      question:
        "Em uma escala de 0 a 10, quao bem voce consegue se regular emocionalmente em momentos de alta tensao?",
      target_field: "emotional_profile.emotional_intelligence.self_regulation",
      question_type: "scale",
      mapper: (answer) => ({
        "emotional_profile.emotional_intelligence.self_regulation": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q07_empathy",
      question:
        "Se um colega comeca a chorar no trabalho, o que voce sentiria e faria? Depois, se avalie de 0 a 10 em empatia.",
      target_field: "emotional_profile.emotional_intelligence.empathy",
      question_type: "scenario",
      mapper: (answer) => ({
        "emotional_profile.emotional_intelligence.empathy": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q08_social_skills",
      question:
        "Numa escala de 0 a 10, quao facil e para voce acalmar uma situacao emocional tensa entre pessoas?",
      target_field: "emotional_profile.emotional_intelligence.social_skills",
      question_type: "scale",
      mapper: (answer) => ({
        "emotional_profile.emotional_intelligence.social_skills": parseScale(answer, 0, 10),
      }),
    },
    {
      id: "q09_attachment_primary",
      question:
        "Me conta sobre um momento em que voce se sentiu verdadeiramente seguro(a) emocionalmente com alguem.",
      target_field: "emotional_profile.attachment_style.primary",
      question_type: "story",
      mapper: (answer) => ({
        "emotional_profile.attachment_style.primary": parseAttachmentStyle(answer),
      }),
    },
    {
      id: "q10_attachment_romantic",
      question: (profile) => getRelationshipContext(profile),
      target_field: "emotional_profile.attachment_style.in_romantic_relationships",
      question_type: "scenario",
      mapper: (answer) => ({
        "emotional_profile.attachment_style.in_romantic_relationships": answer.trim(),
      }),
    },
    {
      id: "q11_attachment_friendships",
      question:
        "Nas amizades, voce tende a se aproximar rapido e confiar ou manter distancia ate ter mais garantias?",
      target_field: "emotional_profile.attachment_style.in_friendships",
      question_type: "scenario",
      mapper: (answer) => ({ "emotional_profile.attachment_style.in_friendships": answer.trim() }),
    },
    {
      id: "q12_attachment_authority",
      question: (profile) => getAuthorityContext(profile),
      target_field: "emotional_profile.attachment_style.with_authority",
      question_type: "projection",
      mapper: (answer) => ({ "emotional_profile.attachment_style.with_authority": answer.trim() }),
    },
    {
      id: "q13_attachment_evidence",
      question: "Que sinais concretos fazem voce sentir seguranca emocional em uma relacao?",
      target_field: "emotional_profile.attachment_style.evidence",
      question_type: "evidence",
      mapper: (answer) => ({ "emotional_profile.attachment_style.evidence": toEvidence(answer) }),
    },
    {
      id: "q14_emotional_triggers",
      question:
        "O que te irrita profundamente, mesmo que pareca pequeno para outras pessoas? Cite um exemplo.",
      target_field: "emotional_profile.emotional_triggers",
      question_type: "scenario",
      mapper: (answer) => ({ "emotional_profile.emotional_triggers": toTriggerEntry(answer) }),
    },
    {
      id: "q15_healthy_coping",
      question:
        "Quando esta passando por um momento muito dificil, qual e a primeira coisa saudavel que voce faz para lidar? Separe por virgula se houver mais de uma.",
      target_field: "emotional_profile.coping_mechanisms.healthy",
      question_type: "reflection",
      mapper: (answer) => ({ "emotional_profile.coping_mechanisms.healthy": parseCsv(answer) }),
    },
    {
      id: "q16_unhealthy_coping",
      question:
        "E quais estrategias menos saudaveis voce percebe que as vezes usa para aliviar emocoes dificeis?",
      target_field: "emotional_profile.coping_mechanisms.unhealthy",
      question_type: "reflection",
      mapper: (answer) => ({ "emotional_profile.coping_mechanisms.unhealthy": parseCsv(answer) }),
    },
    {
      id: "q17_defense_mechanisms",
      question:
        "Quando alguem te critica, qual e sua reacao automatica antes de pensar? (ex.: negar, racionalizar, projetar, usar humor)",
      target_field: "emotional_profile.coping_mechanisms.primary_defense_mechanisms",
      question_type: "projection",
      mapper: (answer) => ({
        "emotional_profile.coping_mechanisms.primary_defense_mechanisms":
          parseDefenseMechanisms(answer),
      }),
    },
    {
      id: "q18_under_stress",
      question:
        "Sob estresse continuo, qual padrao emocional e comportamental aparece primeiro em voce?",
      target_field: "emotional_profile.coping_mechanisms.under_stress",
      question_type: "scenario",
      mapper: (answer) => ({ "emotional_profile.coping_mechanisms.under_stress": answer.trim() }),
    },
    {
      id: "q19_under_conflict",
      question:
        "Em conflito direto com alguem importante, qual tendencia aparece: confronto, afastamento, conciliacao ou outra?",
      target_field: "emotional_profile.coping_mechanisms.under_conflict",
      question_type: "scenario",
      mapper: (answer) => ({ "emotional_profile.coping_mechanisms.under_conflict": answer.trim() }),
    },
    {
      id: "q20_under_pressure",
      question:
        "Quando a pressao por resultado fica alta, como seu emocional afeta suas decisoes na pratica?",
      target_field: "emotional_profile.coping_mechanisms.under_pressure",
      question_type: "scenario",
      mapper: (answer) => ({ "emotional_profile.coping_mechanisms.under_pressure": answer.trim() }),
    },
    {
      id: "q21_emotional_needs",
      question:
        "Quais necessidades emocionais sao mais importantes para voce em relacoes proximas? Separe por virgula.",
      target_field: "emotional_profile.emotional_needs",
      question_type: "open",
      mapper: (answer) => ({ "emotional_profile.emotional_needs": parseCsv(answer) }),
    },
    {
      id: "q22_expression_style",
      question:
        "No geral, voce expressa emocoes de forma aberta, contida ou seletiva dependendo do contexto? Explique.",
      target_field: "emotional_profile.emotional_expression_style",
      question_type: "open",
      mapper: (answer) => ({ "emotional_profile.emotional_expression_style": answer.trim() }),
    },
  ],
};

module.exports = {
  PHASE_06,
};
