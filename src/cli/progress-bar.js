function renderProgress(percent, width = 20) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)} ${clamped.toFixed(0)}%`;
}

module.exports = {
  renderProgress,
};
