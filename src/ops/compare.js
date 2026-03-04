function toSet(value) {
  if (!Array.isArray(value)) {
    return new Set();
  }
  return new Set(value.map((item) => String(item).trim().toLowerCase()).filter(Boolean));
}

function sharedItems(a, b) {
  const out = [];
  for (const item of a) {
    if (b.has(item)) {
      out.push(item);
    }
  }
  return out;
}

function buildProfileComparison({
  leftProfile,
  leftState,
  rightProfile,
  rightState,
  leftId,
  rightId,
}) {
  const leftCompleteness = Number(leftProfile.meta?.completeness_score || 0);
  const rightCompleteness = Number(rightProfile.meta?.completeness_score || 0);
  const deltaCompleteness = Number((leftCompleteness - rightCompleteness).toFixed(2));
  const leftValues = toSet(leftProfile.values_and_beliefs?.hierarchy_of_values?.slice(0, 5));
  const rightValues = toSet(rightProfile.values_and_beliefs?.hierarchy_of_values?.slice(0, 5));
  const overlapValues = sharedItems(leftValues, rightValues);

  const leftWords = toSet(leftProfile.synthesis?.in_three_words || []);
  const rightWords = toSet(rightProfile.synthesis?.in_three_words || []);
  const overlapWords = sharedItems(leftWords, rightWords);

  return [
    `Comparacao de perfis: ${leftId} vs ${rightId}`,
    `- Fase atual: ${leftState.current_phase || "-"} vs ${rightState.current_phase || "-"}`,
    `- Completude: ${leftCompleteness.toFixed(2)}% vs ${rightCompleteness.toFixed(2)}% (delta ${deltaCompleteness} p.p.)`,
    `- Perguntas respondidas: ${leftState.total_questions || 0} vs ${rightState.total_questions || 0}`,
    `- Valores em comum (top 5): ${overlapValues.length > 0 ? overlapValues.join(", ") : "nenhum"}`,
    `- Palavras-sintese em comum: ${overlapWords.length > 0 ? overlapWords.join(", ") : "nenhuma"}`,
    `- Papel profissional: ${leftProfile.professional?.current_role || "-"} vs ${rightProfile.professional?.current_role || "-"}`,
    `- Essencia: ${leftProfile.synthesis?.core_essence_paragraph || "-"} | ${rightProfile.synthesis?.core_essence_paragraph || "-"}`,
  ].join("\n");
}

module.exports = {
  buildProfileComparison,
};
