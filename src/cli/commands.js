const INTERVIEW_COMMANDS = Object.freeze([
  "help",
  "status",
  "save",
  "new",
  "pause",
  "menu",
]);

const INTERVIEW_COMMAND_SET = new Set(INTERVIEW_COMMANDS);

function tokenizeSlashInput(input) {
  const raw = String(input || "").trim();
  if (!raw.startsWith("/")) {
    return null;
  }
  const withoutSlash = raw.slice(1).trim();
  if (!withoutSlash) {
    return {
      raw,
      command: "",
      args: [],
      argsText: "",
      known: false,
    };
  }
  const [name, ...args] = withoutSlash.split(/\s+/);
  const command = String(name || "").toLowerCase();
  const argsText = withoutSlash.slice(name.length).trim();
  return {
    raw,
    command,
    args,
    argsText,
    known: INTERVIEW_COMMAND_SET.has(command),
  };
}

function parseInterviewCommand(input) {
  const parsed = tokenizeSlashInput(input);
  if (!parsed || !parsed.known) {
    return null;
  }
  return {
    command: parsed.command,
    args: parsed.args,
    argsText: parsed.argsText,
    raw: parsed.raw,
  };
}

function parseSlashInput(input) {
  return tokenizeSlashInput(input);
}

function buildInterviewCommandsHelp() {
  return [
    "Comandos disponiveis:",
    "- /help  Mostra esta ajuda rapida",
    "- /status  Exibe progresso atual da entrevista",
    "- /save  Salva snapshot para handoff de agente",
    "- /new  Inicia nova sessao de agente com o ultimo handoff",
    "- /pause  Encerra a sessao atual com persistencia",
    "- /menu  Volta ao menu principal sem perder dados",
  ].join("\n");
}

module.exports = {
  INTERVIEW_COMMANDS,
  buildInterviewCommandsHelp,
  parseInterviewCommand,
  parseSlashInput,
};
