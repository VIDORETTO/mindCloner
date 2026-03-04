const { PHASE_01 } = require("./phase-01-identity");
const { PHASE_02 } = require("./phase-02-lifestyle");
const { PHASE_03 } = require("./phase-03-professional");
const { PHASE_04 } = require("./phase-04-social");
const { PHASE_05 } = require("./phase-05-personality");
const { PHASE_06 } = require("./phase-06-emotional");
const { PHASE_07 } = require("./phase-07-values");
const { PHASE_08 } = require("./phase-08-cognitive");
const { PHASE_09 } = require("./phase-09-deep-psychology");
const { PHASE_10 } = require("./phase-10-integration");

const PHASES = new Map([
  [1, PHASE_01],
  [2, PHASE_02],
  [3, PHASE_03],
  [4, PHASE_04],
  [5, PHASE_05],
  [6, PHASE_06],
  [7, PHASE_07],
  [8, PHASE_08],
  [9, PHASE_09],
  [10, PHASE_10],
]);

function getPhase(phaseNumber) {
  const phase = PHASES.get(phaseNumber);
  if (!phase) {
    throw new Error(`Fase nao implementada: ${phaseNumber}`);
  }
  return phase;
}

module.exports = {
  getPhase,
  getMaxPhaseNumber: () => Math.max(...PHASES.keys()),
};
