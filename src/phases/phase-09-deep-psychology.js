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
  if (["sim", "s", "yes", "y", "true", "1"].includes(normalized)) {
    return true;
  }
  if (["nao", "não", "n", "no", "false", "0"].includes(normalized)) {
    return false;
  }
  return null;
}

function parseMotivations(answer) {
  return parseCsv(answer).map((motivation) => ({
    motivation,
    strength: null,
    origin: "",
  }));
}

function parseFears(answer) {
  return parseCsv(answer).map((fear) => ({
    fear,
    intensity: null,
    rational_or_irrational: "",
    origin: "",
  }));
}

function parseDesires(answer) {
  return parseCsv(answer).map((desire) => ({
    desire,
    intensity: null,
    likelihood_of_pursuit: "",
  }));
}

function parseInsecurities(answer) {
  return parseCsv(answer).map((insecurity) => ({
    insecurity,
    intensity: null,
    coping: "",
  }));
}

function parseTurningPoints(answer) {
  return parseCsv(answer).map((event) => ({
    event,
    age: null,
    impact: "",
    before_after: "",
  }));
}

function normalizeDeepQuestion(question) {
  return `Essa e uma pergunta mais profunda, sinta-se livre para responder como quiser ou pular.\n${question}`;
}

function getHistoricalConnection(profile) {
  const value = profile.values_and_beliefs?.core_values?.[0]?.value;
  if (value) {
    return normalizeDeepQuestion(
      `La no inicio voce destacou ${value} como valor central. Em que momento da sua vida esse valor foi mais testado?`
    );
  }
  return normalizeDeepQuestion(
    "Pensando na sua historia, em que momento voce sentiu que seus principios foram mais testados?"
  );
}

const PHASE_09 = {
  number: 9,
  id: "phase_09",
  name: "Psicologia Profunda",
  objective:
    "Explorar motivacoes inconscientes, medos, desejos, autoconceito e narrativa de vida com alta sensibilidade.",
  rules: [
    "Normalizar todas as perguntas profundas com opcao explicita de pular",
    "Validar emocao apos respostas sensiveis antes de prosseguir",
    "Usar tecnicas projetivas, existenciais e conexoes com historico das fases anteriores",
  ],
  targetFields: [
    "motivations_and_drives.core_motivations",
    "motivations_and_drives.intrinsic_motivators",
    "motivations_and_drives.what_gets_them_out_of_bed",
    "motivations_and_drives.what_keeps_them_up_at_night",
    "motivations_and_drives.deepest_fears",
    "motivations_and_drives.deepest_desires",
    "motivations_and_drives.life_goals.future",
    "motivations_and_drives.purpose_sense.has_clear_purpose",
    "motivations_and_drives.purpose_sense.purpose_statement",
    "self_concept.self_image",
    "self_concept.self_esteem_level",
    "self_concept.self_compassion_level",
    "self_concept.ideal_self",
    "self_concept.gap_real_vs_ideal",
    "self_concept.insecurities",
    "self_concept.inner_critic.intensity",
    "self_concept.inner_critic.common_messages",
    "self_concept.relationship_with_past_self",
    "life_narrative.turning_points",
    "life_narrative.formative_experiences",
    "life_narrative.proudest_moments",
    "life_narrative.deepest_regrets",
    "life_narrative.unresolved_issues",
    "life_narrative.legacy_desire",
  ],
  completionThreshold: 1,
  opening:
    "Agora entramos na fase mais delicada: psicologia profunda. Voce pode responder no nivel que for confortavel e usar /skip quando quiser.",
  transitionMessage:
    "Obrigado pela profundidade. Com isso, vamos para a Fase 10 de integracao e sintese.",
  emotionalValidationMessage: "Obrigado por compartilhar isso, nao e facil.",
  questions: [
    {
      id: "q01_core_motivations",
      question: normalizeDeepQuestion(
        "Quais motivacoes centrais movem suas decisoes hoje? Separe por virgula."
      ),
      target_field: "motivations_and_drives.core_motivations",
      question_type: "projective",
      mapper: (answer) => ({ "motivations_and_drives.core_motivations": parseMotivations(answer) }),
    },
    {
      id: "q02_intrinsic_motivators",
      question: normalizeDeepQuestion(
        "O que te motiva por dentro, mesmo sem reconhecimento externo? Separe por virgula."
      ),
      target_field: "motivations_and_drives.intrinsic_motivators",
      question_type: "projective",
      mapper: (answer) => ({ "motivations_and_drives.intrinsic_motivators": parseCsv(answer) }),
    },
    {
      id: "q04_gets_out_of_bed",
      question: normalizeDeepQuestion("O que te tira da cama nos dias dificeis?"),
      target_field: "motivations_and_drives.what_gets_them_out_of_bed",
      question_type: "motivational",
      mapper: (answer) => ({ "motivations_and_drives.what_gets_them_out_of_bed": answer.trim() }),
    },
    {
      id: "q05_keeps_up_at_night",
      question: normalizeDeepQuestion("O que costuma te manter acordado(a) a noite?"),
      target_field: "motivations_and_drives.what_keeps_them_up_at_night",
      question_type: "motivational",
      mapper: (answer) => ({ "motivations_and_drives.what_keeps_them_up_at_night": answer.trim() }),
    },
    {
      id: "q06_deepest_fears",
      question: normalizeDeepQuestion(
        "Se pudesse eliminar um medo da sua vida, qual seria? Se houver mais de um, separe por virgula."
      ),
      target_field: "motivations_and_drives.deepest_fears",
      question_type: "projective",
      mapper: (answer) => ({ "motivations_and_drives.deepest_fears": parseFears(answer) }),
    },
    {
      id: "q07_deepest_desires",
      question: normalizeDeepQuestion(
        "Se nao existissem limitacoes, o que voce estaria buscando agora? Separe por virgula."
      ),
      target_field: "motivations_and_drives.deepest_desires",
      question_type: "projective",
      mapper: (answer) => ({ "motivations_and_drives.deepest_desires": parseDesires(answer) }),
    },
    {
      id: "q08_future_goals",
      question: normalizeDeepQuestion(
        "Quais metas de vida ainda quer realizar no futuro? Separe por virgula."
      ),
      target_field: "motivations_and_drives.life_goals.future",
      question_type: "existential",
      mapper: (answer) => ({ "motivations_and_drives.life_goals.future": parseCsv(answer) }),
    },
    {
      id: "q09_has_clear_purpose",
      question: normalizeDeepQuestion("Hoje voce sente que tem um proposito claro? (sim/nao)"),
      target_field: "motivations_and_drives.purpose_sense.has_clear_purpose",
      question_type: "existential",
      mapper: (answer) => ({
        "motivations_and_drives.purpose_sense.has_clear_purpose": parseBoolean(answer),
      }),
    },
    {
      id: "q10_purpose_statement",
      question: normalizeDeepQuestion(
        "Se tivesse que resumir seu proposito em uma frase, qual seria?"
      ),
      target_field: "motivations_and_drives.purpose_sense.purpose_statement",
      question_type: "existential",
      mapper: (answer) => ({
        "motivations_and_drives.purpose_sense.purpose_statement": answer.trim(),
      }),
    },
    {
      id: "q11_self_image",
      question: normalizeDeepQuestion(
        "Se seu melhor amigo descrevesse quem voce realmente e, o que diria?"
      ),
      target_field: "self_concept.self_image",
      question_type: "mirror",
      mapper: (answer) => ({ "self_concept.self_image": answer.trim() }),
    },
    {
      id: "q12_self_esteem",
      question: normalizeDeepQuestion("Em escala 0-10, como esta sua autoestima hoje?"),
      target_field: "self_concept.self_esteem_level",
      question_type: "scale",
      mapper: (answer) => ({ "self_concept.self_esteem_level": parseScale(answer, 0, 10) }),
    },
    {
      id: "q13_self_compassion",
      question: normalizeDeepQuestion(
        "Em escala 0-10, quanta autocompaixao voce pratica quando falha?"
      ),
      target_field: "self_concept.self_compassion_level",
      question_type: "scale",
      mapper: (answer) => ({ "self_concept.self_compassion_level": parseScale(answer, 0, 10) }),
    },
    {
      id: "q14_ideal_self",
      question: normalizeDeepQuestion("Como seria sua versao ideal daqui a alguns anos?"),
      target_field: "self_concept.ideal_self",
      question_type: "existential",
      mapper: (answer) => ({ "self_concept.ideal_self": answer.trim() }),
    },
    {
      id: "q15_gap_real_vs_ideal",
      question: normalizeDeepQuestion(
        "Qual e hoje o maior gap entre quem voce e e quem quer se tornar?"
      ),
      target_field: "self_concept.gap_real_vs_ideal",
      question_type: "reflection",
      mapper: (answer) => ({ "self_concept.gap_real_vs_ideal": answer.trim() }),
    },
    {
      id: "q16_insecurities",
      question: normalizeDeepQuestion(
        "Quais insegurancas te visitam com mais frequencia? Separe por virgula."
      ),
      target_field: "self_concept.insecurities",
      question_type: "reflection",
      mapper: (answer) => ({ "self_concept.insecurities": parseInsecurities(answer) }),
    },
    {
      id: "q17_inner_critic_intensity",
      question: normalizeDeepQuestion(
        "Quando voce falha, qual a intensidade do seu critico interno em escala 0-10?"
      ),
      target_field: "self_concept.inner_critic.intensity",
      question_type: "dialog",
      mapper: (answer) => ({ "self_concept.inner_critic.intensity": parseScale(answer, 0, 10) }),
    },
    {
      id: "q18_inner_critic_messages",
      question: normalizeDeepQuestion(
        "Quais mensagens seu critico interno costuma repetir? Separe por virgula."
      ),
      target_field: "self_concept.inner_critic.common_messages",
      question_type: "dialog",
      mapper: (answer) => ({ "self_concept.inner_critic.common_messages": parseCsv(answer) }),
    },
    {
      id: "q19_past_self",
      question: getHistoricalConnection,
      target_field: "self_concept.relationship_with_past_self",
      question_type: "reflection",
      mapper: (answer) => ({ "self_concept.relationship_with_past_self": answer.trim() }),
    },
    {
      id: "q20_turning_points",
      question: normalizeDeepQuestion(
        "Quais foram seus principais pontos de virada de vida? Separe por virgula."
      ),
      target_field: "life_narrative.turning_points",
      question_type: "narrative",
      mapper: (answer) => ({ "life_narrative.turning_points": parseTurningPoints(answer) }),
    },
    {
      id: "q21_formative_experiences",
      question: normalizeDeepQuestion(
        "Quais experiencias mais te moldaram como pessoa? Separe por virgula."
      ),
      target_field: "life_narrative.formative_experiences",
      question_type: "narrative",
      mapper: (answer) => ({ "life_narrative.formative_experiences": parseCsv(answer) }),
    },
    {
      id: "q22_proudest_moments",
      question: normalizeDeepQuestion(
        "Quais momentos da sua historia mais te deram orgulho? Separe por virgula."
      ),
      target_field: "life_narrative.proudest_moments",
      question_type: "narrative",
      mapper: (answer) => ({ "life_narrative.proudest_moments": parseCsv(answer) }),
    },
    {
      id: "q23_deepest_regrets",
      question: normalizeDeepQuestion(
        "Qual decisao voce mais reconsiderou na vida? Se houver mais de uma, separe por virgula."
      ),
      target_field: "life_narrative.deepest_regrets",
      question_type: "narrative",
      mapper: (answer) => ({ "life_narrative.deepest_regrets": parseCsv(answer) }),
    },
    {
      id: "q24_unresolved_issues",
      question: normalizeDeepQuestion(
        "Quais temas sente que ainda estao em aberto na sua historia? Separe por virgula."
      ),
      target_field: "life_narrative.unresolved_issues",
      question_type: "narrative",
      mapper: (answer) => ({ "life_narrative.unresolved_issues": parseCsv(answer) }),
    },
    {
      id: "q25_legacy_desire",
      question: normalizeDeepQuestion("Como voce gostaria de ser lembrado(a)?"),
      target_field: "life_narrative.legacy_desire",
      question_type: "existential",
      mapper: (answer) => ({ "life_narrative.legacy_desire": answer.trim() }),
    },
  ],
};

module.exports = {
  PHASE_09,
};
