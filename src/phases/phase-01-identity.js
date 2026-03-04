function parseList(value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized || ["nenhum", "nenhuma", "nao", "não", "n", "sem"].includes(normalized)) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLanguages(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((language, index) => ({
      language,
      proficiency: index === 0 ? "native_or_fluent" : "unknown",
      is_native: index === 0,
    }));
}

const PHASE_01 = {
  number: 1,
  id: "phase_01",
  name: "Identidade e Contexto Fundacional",
  objective: "Estabelecer quem é a pessoa no nível factual com perguntas leves.",
  rules: ["Perguntas 100% factuais", "Tom acolhedor e leve", "Não fazer inferências prematuras"],
  targetFields: [
    "identity.full_name",
    "identity.preferred_name",
    "identity.age",
    "identity.location.current_city",
    "identity.location.current_country",
    "identity.location.born_in",
    "identity.family.marital_status",
    "identity.family.children",
    "identity.family.siblings",
    "identity.languages",
    "identity.ethnicity_cultural_background",
  ],
  completionThreshold: 0.8,
  opening: "Ola! Sou o MindClone e vamos comecar com calma. Qual e o seu nome completo?",
  transitionMessage:
    "Agora que sei um pouco sobre quem voce e, quero entender como e seu dia a dia. Vamos para a Fase 2?",
  questions: [
    {
      id: "q01_full_name",
      question: "Qual e o seu nome completo?",
      target_field: "identity.full_name",
      question_type: "open",
      mapper: (answer) => ({ "identity.full_name": answer.trim() }),
    },
    {
      id: "q02_preferred_name",
      question: "Como voce prefere ser chamado(a)?",
      target_field: "identity.preferred_name",
      question_type: "open",
      mapper: (answer) => ({ "identity.preferred_name": answer.trim() }),
    },
    {
      id: "q03_age",
      question: "Qual e a sua idade?",
      target_field: "identity.age",
      question_type: "open",
      mapper: (answer) => {
        const parsedAge = Number.parseInt(answer.replace(/[^\d]/g, ""), 10);
        return { "identity.age": Number.isNaN(parsedAge) ? null : parsedAge };
      },
    },
    {
      id: "q04_current_city",
      question: "Em qual cidade voce mora atualmente?",
      target_field: "identity.location.current_city",
      question_type: "open",
      mapper: (answer) => ({ "identity.location.current_city": answer.trim() }),
    },
    {
      id: "q05_current_country",
      question: "Em qual pais voce mora atualmente?",
      target_field: "identity.location.current_country",
      question_type: "open",
      mapper: (answer) => ({ "identity.location.current_country": answer.trim() }),
    },
    {
      id: "q06_born_in",
      question: "Onde voce nasceu?",
      target_field: "identity.location.born_in",
      question_type: "open",
      mapper: (answer) => ({ "identity.location.born_in": answer.trim() }),
    },
    {
      id: "q07_marital_status",
      question: "Qual e a sua situacao familiar atual (estado civil)?",
      target_field: "identity.family.marital_status",
      question_type: "open",
      mapper: (answer) => ({ "identity.family.marital_status": answer.trim() }),
    },
    {
      id: "q08_children",
      question: "Voce tem filhos? Se sim, liste os nomes separados por virgula.",
      target_field: "identity.family.children",
      question_type: "open",
      mapper: (answer) => ({ "identity.family.children": parseList(answer) }),
    },
    {
      id: "q09_siblings",
      question: "Voce tem irmaos? Se sim, liste os nomes separados por virgula.",
      target_field: "identity.family.siblings",
      question_type: "open",
      mapper: (answer) => ({ "identity.family.siblings": parseList(answer) }),
    },
    {
      id: "q10_languages",
      question: "Quais idiomas voce fala? Separe por virgula.",
      target_field: "identity.languages",
      question_type: "open",
      mapper: (answer) => ({ "identity.languages": parseLanguages(answer) }),
    },
    {
      id: "q11_cultural_background",
      question: "Qual e o seu contexto cultural/etnico?",
      target_field: "identity.ethnicity_cultural_background",
      question_type: "open",
      mapper: (answer) => ({ "identity.ethnicity_cultural_background": answer.trim() }),
    },
  ],
};

module.exports = {
  PHASE_01,
};
