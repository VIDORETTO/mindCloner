const { getPhase } = require("../phases/phase-manager");
const { getEmptyFields } = require("../profile/profile-builder");
const { selectNextQuestion } = require("../engine/question-engine");

function normalizeFieldPath(value) {
  return String(value || "").trim();
}

function listContradictionFields(contradictions, phaseTargetFields) {
  if (!Array.isArray(contradictions) || contradictions.length === 0) {
    return [];
  }
  const fields = [];
  const seen = new Set();
  for (const entry of contradictions) {
    const unresolved = entry && typeof entry === "object" ? !entry.resolved : true;
    if (!unresolved) {
      continue;
    }
    const entryFields = Array.isArray(entry?.fields) ? entry.fields : [];
    for (const rawField of entryFields) {
      const normalized = normalizeFieldPath(rawField);
      if (!normalized) {
        continue;
      }
      if (Array.isArray(phaseTargetFields) && !phaseTargetFields.includes(normalized)) {
        continue;
      }
      if (seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      fields.push(normalized);
    }
  }
  return fields;
}

function buildFieldLabel(targetField) {
  return normalizeFieldPath(targetField).split(".").slice(-2).join(" ").replace(/_/g, " ").trim();
}

function buildAdaptiveRecoveryQuestion(phase, targetField) {
  const label = buildFieldLabel(targetField) || "esse ponto";
  const candidate = phase.questions.find((item) => item.target_field === targetField);
  if (candidate) {
    return {
      ...candidate,
      id: `${candidate.id}_adaptive_refine`,
      question_type: candidate.question_type || "adaptive",
    };
  }
  return {
    id: `adaptive_${targetField.replace(/[^a-z0-9]+/gi, "_")}`,
    question: `Quero entender melhor ${label}. Pode me dar um exemplo concreto?`,
    target_field: targetField,
    question_type: "adaptive",
    mapper: (answer) => ({ [targetField]: answer.trim() }),
  };
}

function selectAdaptiveQuestion({
  currentPhaseNumber,
  profile,
  tracker,
  contradictions,
  lastEntry,
}) {
  const phase = getPhase(currentPhaseNumber);
  const emptyFields = getEmptyFields(phase.targetFields, profile);
  const contradictionFields = listContradictionFields(contradictions, phase.targetFields);
  const prioritizedFields = contradictionFields.filter((field) => emptyFields.includes(field));

  if (prioritizedFields.length > 0) {
    const field = prioritizedFields[0];
    return {
      phase,
      emptyFields,
      reason: "contradiction-gap",
      question: buildAdaptiveRecoveryQuestion(phase, field),
    };
  }

  const nextQuestion = selectNextQuestion({
    phase,
    tracker,
    emptyFields,
    lastEntry,
  });
  if (nextQuestion) {
    return {
      phase,
      emptyFields,
      reason: "gap",
      question: nextQuestion,
    };
  }

  if (emptyFields.length > 0) {
    const field = emptyFields[0];
    return {
      phase,
      emptyFields,
      reason: "fallback-gap",
      question: buildAdaptiveRecoveryQuestion(phase, field),
    };
  }

  return null;
}

module.exports = {
  selectAdaptiveQuestion,
};
