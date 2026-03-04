const { createEmptyProfile } = require("../profile/profile-schema");
const { getByPath } = require("../utils/object-path");

const SCHEMA_TEMPLATE = createEmptyProfile("__validator__");
const GENERIC_TARGET_TOKENS = new Set([
  "meta",
  "identity",
  "profile",
  "patterns",
  "style",
  "summary",
  "level",
  "primary",
  "secondary",
  "synthesis",
  "values",
  "beliefs",
]);
const STOPWORDS = new Set([
  "a",
  "ao",
  "aos",
  "as",
  "com",
  "como",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "essa",
  "esse",
  "isso",
  "mais",
  "na",
  "no",
  "nos",
  "o",
  "os",
  "ou",
  "para",
  "por",
  "qual",
  "que",
  "se",
  "sem",
  "sua",
  "suas",
  "suo",
  "te",
  "um",
  "uma",
  "voce",
]);
const AMBIGUOUS_PATTERNS = [
  /\bpode (falar|contar|explicar) mais\b/i,
  /\bme conte mais\b/i,
  /\bpode detalhar\b/i,
  /\bo que acha\b/i,
  /\bcomo assim\b/i,
  /\bsobre isso\b/i,
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueMeaningfulTokens(value) {
  return [...new Set(tokenize(value).filter((item) => item.length > 2 && !STOPWORDS.has(item)))];
}

function jaccardSimilarity(left, right) {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }
  const a = new Set(left);
  const b = new Set(right);
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function normalizeSchemaPath(targetField) {
  if (typeof targetField !== "string") {
    return "";
  }
  if (targetField.startsWith("deepening:")) {
    return targetField.slice("deepening:".length);
  }
  return targetField;
}

function isSchemaMapped(targetField) {
  const path = normalizeSchemaPath(targetField);
  if (!path) {
    return false;
  }
  return getByPath(SCHEMA_TEMPLATE, path) !== undefined;
}

function isPhaseMapped(targetField, phaseTargetFields) {
  if (!Array.isArray(phaseTargetFields) || phaseTargetFields.length === 0) {
    return true;
  }
  if (phaseTargetFields.includes(targetField)) {
    return true;
  }
  const normalized = normalizeSchemaPath(targetField);
  return phaseTargetFields.includes(normalized);
}

function isRepetitive(text, askedQuestions) {
  const normalizedCandidate = normalizeText(text);
  if (!normalizedCandidate) {
    return false;
  }
  const candidateTokens = uniqueMeaningfulTokens(text);
  for (const asked of askedQuestions || []) {
    const askedText = String(asked?.question_text || "");
    const normalizedAsked = normalizeText(askedText);
    if (!normalizedAsked) {
      continue;
    }
    if (normalizedAsked === normalizedCandidate) {
      return true;
    }
    const askedTokens = uniqueMeaningfulTokens(askedText);
    const similarity = jaccardSimilarity(candidateTokens, askedTokens);
    if (similarity >= 0.82 && candidateTokens.length >= 3 && askedTokens.length >= 3) {
      return true;
    }
  }
  return false;
}

function isAmbiguous(text, questionType) {
  if (questionType === "follow-up") {
    return false;
  }
  const normalized = normalizeText(text);
  if (!normalized) {
    return true;
  }
  if (normalized.length < 10) {
    return true;
  }
  return AMBIGUOUS_PATTERNS.some((pattern) => pattern.test(normalized));
}

function isSpecificEnough(text, { targetField, fallbackQuestion, questionType }) {
  if (questionType === "follow-up") {
    return true;
  }

  const normalized = normalizeText(text);
  if (normalized.length < 10) {
    return false;
  }

  const candidateTokens = uniqueMeaningfulTokens(text);
  if (candidateTokens.length === 0) {
    return false;
  }

  const targetTokens = uniqueMeaningfulTokens(normalizeSchemaPath(targetField)).filter(
    (token) => !GENERIC_TARGET_TOKENS.has(token)
  );
  const fallbackTokens = uniqueMeaningfulTokens(fallbackQuestion);
  const hasTargetHint = candidateTokens.some((token) => targetTokens.includes(token));
  const sharedWithFallback = candidateTokens.filter((token) =>
    fallbackTokens.includes(token)
  ).length;
  if (hasTargetHint || sharedWithFallback >= 2) {
    return true;
  }
  return candidateTokens.length >= 3;
}

function validateQuestionCandidate({
  questionText,
  targetField,
  questionType = "open",
  askedQuestions = [],
  phaseTargetFields = [],
  fallbackQuestion = "",
}) {
  const reasons = [];
  const text = String(questionText || "").trim();
  if (!text) {
    reasons.push("empty");
  }
  if (isRepetitive(text, askedQuestions)) {
    reasons.push("repetition");
  }
  if (isAmbiguous(text, questionType)) {
    reasons.push("ambiguity");
  }
  if (!isSpecificEnough(text, { targetField, fallbackQuestion, questionType })) {
    reasons.push("low_specificity");
  }
  if (!isSchemaMapped(targetField) || !isPhaseMapped(targetField, phaseTargetFields)) {
    reasons.push("unmapped_target_field");
  }
  return {
    valid: reasons.length === 0,
    reasons,
  };
}

module.exports = {
  validateQuestionCandidate,
};
