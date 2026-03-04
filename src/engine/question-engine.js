function needsFollowup(lastEntry) {
  if (!lastEntry || typeof lastEntry.response !== "string") {
    return false;
  }
  if (!lastEntry.allow_followup) {
    return false;
  }
  const words = lastEntry.response.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 2;
}

function buildFollowup(lastQuestion) {
  return {
    id: `${lastQuestion.id}_followup`,
    question: "Pode detalhar um pouco mais sua resposta?",
    target_field: lastQuestion.target_field,
    question_type: "follow-up",
    mapper: (answer) => ({ [lastQuestion.target_field]: answer.trim() }),
  };
}

function selectNextQuestion({ phase, tracker, emptyFields, lastEntry }) {
  if (needsFollowup(lastEntry)) {
    const original = phase.questions.find((item) => item.target_field === lastEntry.target_field);
    if (original) {
      return buildFollowup(original);
    }
  }

  for (const field of phase.targetFields) {
    if (!emptyFields.includes(field)) {
      continue;
    }
    const candidate = phase.questions.find((item) => item.target_field === field);
    if (!candidate) {
      continue;
    }
    if (tracker.hasAskedAbout(field)) {
      continue;
    }
    return candidate;
  }

  return null;
}

module.exports = {
  selectNextQuestion,
};
