class ContextManager {
  constructor(maxTokens = 8000) {
    this.maxTokens = maxTokens;
  }

  estimateTokens(text) {
    return Math.ceil(String(text).length / 4);
  }

  build({
    systemPrompt,
    phasePrompt,
    profile,
    askedQuestions,
    contradictions,
    recentConversation,
    emptyFields,
    handoffContext,
  }) {
    const messages = [];
    let tokenCount = 0;

    const fixedBlocks = [
      { role: "system", content: systemPrompt },
      { role: "system", content: phasePrompt },
      { role: "system", content: `PERFIL ATUAL:\n${JSON.stringify(profile)}` },
      { role: "system", content: `PERGUNTAS JA FEITAS:\n${JSON.stringify(askedQuestions)}` },
      { role: "system", content: `CAMPOS VAZIOS:\n${emptyFields.join("\n")}` },
    ];

    if (Array.isArray(contradictions) && contradictions.length > 0) {
      fixedBlocks.push({
        role: "system",
        content: `CONTRADICOES:\n${JSON.stringify(contradictions)}`,
      });
    }
    if (handoffContext && typeof handoffContext === "object") {
      fixedBlocks.push({
        role: "system",
        content: `CONTEXTO DE HANDOFF:\n${JSON.stringify(handoffContext)}`,
      });
    }

    for (const block of fixedBlocks) {
      messages.push(block);
      tokenCount += this.estimateTokens(block.content);
    }

    const budget = this.maxTokens - tokenCount - 300;
    if (budget <= 0) {
      return messages;
    }

    const reverse = [...recentConversation].reverse();
    const fitted = [];
    let used = 0;
    for (const msg of reverse) {
      const cost = this.estimateTokens(msg.content);
      if (used + cost > budget) {
        break;
      }
      fitted.push(msg);
      used += cost;
    }

    return [...messages, ...fitted.reverse()];
  }
}

module.exports = {
  ContextManager,
};
