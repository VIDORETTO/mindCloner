const { calculateCompleteness, getPhaseTargetFields } = require("./profile-builder");

function scorePhase(phaseNumber, profile) {
  const fields = getPhaseTargetFields(phaseNumber);
  return Number((calculateCompleteness(fields, profile) * 100).toFixed(2));
}

module.exports = {
  scorePhase,
};
