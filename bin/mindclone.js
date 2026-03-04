#!/usr/bin/env node

const { runFromCli } = require("../src/cli/menu");

runFromCli(process.argv).catch((error) => {
  console.error("Erro ao executar MindClone:", error.message);
  process.exitCode = 1;
});
