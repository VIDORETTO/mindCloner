const HIGH_RISK_PATTERNS = [
  /quero\s+morrer/i,
  /vou\s+me\s+matar/i,
  /me\s+matar/i,
  /suicid/i,
  /tirar\s+a\s+minha\s+vida/i,
  /acabar\s+com\s+tudo/i,
  /nao\s+aguento\s+mais\s+viver/i,
  /i\s+want\s+to\s+die/i,
  /kill\s+myself/i,
  /end\s+my\s+life/i,
  /hurt\s+myself/i,
];

function detectCrisisRisk(input) {
  const text = String(input || "").trim();
  if (!text) {
    return { detected: false };
  }

  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(text)) {
      return {
        detected: true,
        level: "high",
        reason: "self-harm-indicator",
        matchedPattern: pattern.toString(),
      };
    }
  }

  return { detected: false };
}

function buildCrisisSupportMessage() {
  return [
    "Sinto muito que voce esteja passando por isso.",
    "Nao posso seguir com o aprofundamento neste momento.",
    "Se houver risco imediato, ligue agora para 192 (SAMU) ou 190.",
    "No Brasil, voce tambem pode buscar apoio emocional 24h no CVV: 188 (ligacao gratuita).",
    "Se puder, procure uma pessoa de confianca para ficar com voce agora.",
  ].join(" ");
}

function createCrisisEvent({ phaseNumber, questionId, userInput, risk }) {
  return {
    type: "emotional_crisis_protocol",
    level: risk.level || "high",
    reason: risk.reason || "self-harm-indicator",
    detected_at: new Date().toISOString(),
    phase: phaseNumber,
    question_id: questionId || "",
    matched_pattern: risk.matchedPattern || "",
    user_input_excerpt: String(userInput || "").slice(0, 180),
  };
}

module.exports = {
  detectCrisisRisk,
  buildCrisisSupportMessage,
  createCrisisEvent,
};
