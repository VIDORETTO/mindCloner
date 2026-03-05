function toText(value, fallback = "-") {
  const text = String(value || "").trim();
  return text || fallback;
}

function toList(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return "-";
  }
  const normalized = value.map((item) => toText(item, "")).filter(Boolean);
  return normalized.length > 0 ? normalized.join(", ") : "-";
}

function buildContextPack(profile, state = {}) {
  const identity = profile.identity || {};
  const professional = profile.professional || {};
  const personality = profile.personality || {};
  const values = profile.values_and_beliefs || {};
  const synthesis = profile.synthesis || {};
  const currentPhase = state.current_phase || "-";
  const progress = Number(state.overall_progress || 0).toFixed(0);
  const completeness = Number(profile.meta?.completeness_score || 0).toFixed(2);
  const unresolvedContradictions = Array.isArray(state.detected_contradictions)
    ? state.detected_contradictions.length
    : 0;

  return [
    "# Resumo para IA (Context Pack)",
    "",
    "## Snapshot",
    `- Profile ID: ${toText(profile.meta?.profile_id)}`,
    `- Fase atual: ${currentPhase}`,
    `- Progresso geral: ${progress}%`,
    `- Completude: ${completeness}%`,
    `- Contradicoes abertas: ${unresolvedContradictions}`,
    "",
    "## Identidade e contexto",
    `- Nome preferido: ${toText(identity.preferred_name || identity.full_name)}`,
    `- Papel atual: ${toText(professional.current_role)}`,
    `- Local atual: ${toText(identity.location?.current_city)}, ${toText(identity.location?.current_country)}`,
    "",
    "## Traços centrais",
    `- Personalidade (resumo): ${toText(personality.summary)}`,
    `- Valores principais: ${toList(values.hierarchy_of_values?.slice(0, 5))}`,
    `- Essencia: ${toText(synthesis.core_essence_paragraph)}`,
    `- Combinacao unica: ${toText(synthesis.unique_combination)}`,
    "",
    "## Diretrizes para a proxima IA",
    `- Instrucoes RAG: ${toText(synthesis.rag_instruction)}`,
    `- Tom sugerido: ${toText(synthesis.communication_dna?.[0])}`,
    `- Pontos de crescimento: ${toList(synthesis.growth_edges)}`,
  ].join("\n");
}

module.exports = {
  buildContextPack,
};
