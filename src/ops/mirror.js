function buildMirrorText({ profile, state, journalEntries = [] }) {
  const identity = profile.identity || {};
  const synthesis = profile.synthesis || {};
  const professional = profile.professional || {};
  const emotional = profile.emotional_profile || {};
  const preferredName =
    identity.preferred_name || identity.full_name || profile.meta?.profile_id || "pessoa";
  const values = profile.values_and_beliefs?.hierarchy_of_values?.slice(0, 3) || [];
  const latestJournal = journalEntries[journalEntries.length - 1];
  const phase = state.current_phase || "-";
  const completeness = Number(profile.meta?.completeness_score || 0).toFixed(2);

  return [
    `Espelho de perfil: ${preferredName}`,
    `- Fase atual: ${phase}`,
    `- Completude geral: ${completeness}%`,
    `- Essencia percebida: ${synthesis.core_essence_paragraph || "ainda em construcao"}`,
    `- Papel profissional atual: ${professional.current_role || "nao mapeado"}`,
    `- Humor base: ${emotional.emotional_baseline?.default_mood || "nao informado"}`,
    `- Valores mais fortes: ${values.length > 0 ? values.join(", ") : "nao mapeados"}`,
    latestJournal
      ? `- Ultimo registro diario (${latestJournal.at}): ${latestJournal.text}`
      : "- Ultimo registro diario: nenhum encontrado",
    "",
    "Pergunta de reflexao sugerida:",
    synthesis.growth_edges?.[0]
      ? `Como voce pode evoluir hoje no eixo "${synthesis.growth_edges[0]}" com uma acao pequena e concreta?`
      : "Qual acao concreta de 10 minutos hoje melhor representa quem voce quer se tornar?",
  ].join("\n");
}

module.exports = {
  buildMirrorText,
};
