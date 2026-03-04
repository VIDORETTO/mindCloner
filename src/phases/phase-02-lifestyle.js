function parseCsv(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const PHASE_02 = {
  number: 2,
  id: "phase_02",
  name: "Estilo de Vida e Preferencias",
  objective: "Entender rotina, gostos, habitos e padroes do dia a dia.",
  rules: [
    "Perguntas abertas sobre preferencias e rotina",
    "Identificar padroes iniciais de comportamento",
    "Registrar o que a pessoa enfatiza e como se expressa",
  ],
  targetFields: [
    "behavioral_patterns.daily_routine.morning",
    "behavioral_patterns.daily_routine.afternoon",
    "behavioral_patterns.daily_routine.evening",
    "behavioral_patterns.daily_routine.night",
    "behavioral_patterns.daily_routine.consistency_level",
    "interests_and_preferences.media.books.reading_frequency",
    "interests_and_preferences.media.movies_series.frequency",
    "interests_and_preferences.media.music.role_of_music",
    "interests_and_preferences.food.relationship_with_food",
    "interests_and_preferences.food.cooking_interest",
    "interests_and_preferences.travel.style",
    "interests_and_preferences.travel.frequency",
    "interests_and_preferences.travel.motivation",
    "interests_and_preferences.technology.relationship",
    "interests_and_preferences.technology.adoption_speed",
  ],
  completionThreshold: 0.7,
  opening: "Agora quero entender melhor o seu estilo de vida e preferencias.",
  transitionMessage:
    "Perfeito. Agora que entendi sua rotina e preferencias, vamos para a Fase 3 sobre carreira e perfil profissional.",
  questions: [
    {
      id: "q01_morning_routine",
      question: "Como costuma ser a sua manha em um dia tipico?",
      target_field: "behavioral_patterns.daily_routine.morning",
      question_type: "open",
      mapper: (answer) => ({ "behavioral_patterns.daily_routine.morning": answer.trim() }),
    },
    {
      id: "q02_afternoon_routine",
      question: "E a sua tarde, como geralmente acontece?",
      target_field: "behavioral_patterns.daily_routine.afternoon",
      question_type: "open",
      mapper: (answer) => ({ "behavioral_patterns.daily_routine.afternoon": answer.trim() }),
    },
    {
      id: "q03_evening_hobbies",
      question: "No seu tempo livre, o que voce costuma fazer? (hobbies/interesses)",
      target_field: "behavioral_patterns.daily_routine.evening",
      question_type: "open",
      mapper: (answer) => ({
        "behavioral_patterns.daily_routine.evening": answer.trim(),
        "interests_and_preferences.hobbies": parseCsv(answer).map((hobby) => ({
          hobby,
          frequency: "unknown",
          skill_level: "unknown",
          meaning: "",
        })),
      }),
    },
    {
      id: "q04_night_routine",
      question: "Como costuma ser a sua noite ate a hora de dormir?",
      target_field: "behavioral_patterns.daily_routine.night",
      question_type: "open",
      mapper: (answer) => ({ "behavioral_patterns.daily_routine.night": answer.trim() }),
    },
    {
      id: "q05_routine_consistency",
      question: "Sua rotina e mais estavel ou varia bastante?",
      target_field: "behavioral_patterns.daily_routine.consistency_level",
      question_type: "open",
      mapper: (answer) => ({
        "behavioral_patterns.daily_routine.consistency_level": answer.trim(),
      }),
    },
    {
      id: "q06_media_books",
      question: "Com que frequencia voce le livros?",
      target_field: "interests_and_preferences.media.books.reading_frequency",
      question_type: "open",
      mapper: (answer) => ({
        "interests_and_preferences.media.books.reading_frequency": answer.trim(),
      }),
    },
    {
      id: "q07_media_movies_series",
      question: "Com que frequencia voce assiste filmes ou series?",
      target_field: "interests_and_preferences.media.movies_series.frequency",
      question_type: "open",
      mapper: (answer) => ({
        "interests_and_preferences.media.movies_series.frequency": answer.trim(),
      }),
    },
    {
      id: "q08_media_music",
      question: "Qual papel a musica tem no seu dia a dia?",
      target_field: "interests_and_preferences.media.music.role_of_music",
      question_type: "open",
      mapper: (answer) => ({
        "interests_and_preferences.media.music.role_of_music": answer.trim(),
      }),
    },
    {
      id: "q09_food_relationship",
      question: "Como voce descreveria sua relacao com comida?",
      target_field: "interests_and_preferences.food.relationship_with_food",
      question_type: "open",
      mapper: (answer) => ({
        "interests_and_preferences.food.relationship_with_food": answer.trim(),
      }),
    },
    {
      id: "q10_food_cooking",
      question: "Voce gosta de cozinhar? Como isso aparece na sua rotina?",
      target_field: "interests_and_preferences.food.cooking_interest",
      question_type: "open",
      mapper: (answer) => ({ "interests_and_preferences.food.cooking_interest": answer.trim() }),
    },
    {
      id: "q11_travel_style",
      question: "Que tipo de viagem combina mais com voce?",
      target_field: "interests_and_preferences.travel.style",
      question_type: "open",
      mapper: (answer) => ({ "interests_and_preferences.travel.style": answer.trim() }),
    },
    {
      id: "q12_travel_frequency",
      question: "Com que frequencia voce costuma viajar?",
      target_field: "interests_and_preferences.travel.frequency",
      question_type: "open",
      mapper: (answer) => ({ "interests_and_preferences.travel.frequency": answer.trim() }),
    },
    {
      id: "q13_travel_motivation",
      question: "Quando viaja, o que mais te motiva?",
      target_field: "interests_and_preferences.travel.motivation",
      question_type: "open",
      mapper: (answer) => ({ "interests_and_preferences.travel.motivation": answer.trim() }),
    },
    {
      id: "q14_technology_relationship",
      question: "Como e sua relacao com tecnologia no dia a dia?",
      target_field: "interests_and_preferences.technology.relationship",
      question_type: "open",
      mapper: (answer) => ({ "interests_and_preferences.technology.relationship": answer.trim() }),
    },
    {
      id: "q15_technology_adoption",
      question: "Voce costuma adotar novas tecnologias rapido ou prefere esperar?",
      target_field: "interests_and_preferences.technology.adoption_speed",
      question_type: "open",
      mapper: (answer) => ({
        "interests_and_preferences.technology.adoption_speed": answer.trim(),
      }),
    },
  ],
};

module.exports = {
  PHASE_02,
};
