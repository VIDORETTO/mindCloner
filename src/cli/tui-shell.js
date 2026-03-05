const { Select } = require("enquirer");
const {
  getHomeMenuItems,
  getMenuItemById,
  createInitialUiState,
  reduceUiState,
} = require("./screen-router");

const OPERATIONAL_FLAGS = new Set([
  "--deepening",
  "--status",
  "--resume",
  "--mirror",
  "--compare",
  "--import",
  "--journal",
  "--journal-tags",
  "--telemetry",
  "--export",
  "--provider",
  "--ai-model",
  "--ai-key",
  "--ai-base-url",
  "--ai-timeout",
  "--ai-retries",
  "--interview-mode",
  "--max-questions",
  "--plugin",
  "--setup",
]);

const DOCUMENT_PRESETS = [
  {
    id: "context-pack",
    label: "Resumo para IA",
    help: "Context pack objetivo para iniciar outra IA sem perder contexto.",
    formats: ["context-pack"],
  },
  {
    id: "markdown",
    label: "Perfil completo em Markdown",
    help: "Documento legivel para revisao humana.",
    formats: ["markdown"],
  },
  {
    id: "json",
    label: "JSON estruturado",
    help: "Formato completo para automacoes e integracoes.",
    formats: ["json"],
  },
  {
    id: "summary",
    label: "Resumo executivo",
    help: "Resumo textual curto do estado atual do perfil.",
    formats: ["summary"],
  },
  {
    id: "rag-chunks",
    label: "RAG chunks",
    help: "Fragmentos JSONL para indexacao vetorial.",
    formats: ["rag-chunks"],
  },
  {
    id: "all",
    label: "Pacote completo",
    help: "Exporta todos os formatos disponiveis.",
    formats: ["context-pack", "json", "markdown", "summary", "rag-chunks"],
  },
  {
    id: "back",
    label: "Voltar",
    help: "Retorna ao menu principal sem exportar.",
    formats: [],
  },
];

function shouldUseInteractiveShell({ args, stdin = process.stdin, stdout = process.stdout } = {}) {
  if (!args || typeof args.get !== "function") {
    return false;
  }
  if (args.get("--no-tui")) {
    return false;
  }
  const isTTY = Boolean(stdin?.isTTY && stdout?.isTTY);
  if (!isTTY) {
    return false;
  }
  if (args.get("--tui")) {
    return true;
  }
  for (const flag of OPERATIONAL_FLAGS) {
    if (args.get(flag)) {
      return false;
    }
  }
  return true;
}

function buildHomeMessage({ profileId, baseDir }) {
  return [
    "MindCloner - Menu Principal",
    `Perfil: ${profileId}`,
    `Base: ${baseDir}`,
    "",
    "Use as setas para navegar e Enter para confirmar.",
    "Pressione Ctrl+C para sair rapidamente.",
  ].join("\n");
}

function buildDocumentMessage({ profileId, baseDir }) {
  return [
    "MindCloner - Gerar documento",
    `Perfil: ${profileId}`,
    `Base: ${baseDir}`,
    "",
    "Escolha o preset de exportacao e confirme com Enter.",
  ].join("\n");
}

function createSelectPrompt(config, selectFactory) {
  if (typeof selectFactory === "function") {
    return selectFactory(config);
  }
  return new Select(config);
}

async function runDocumentPresetPrompt({ profileId, baseDir, selectFactory }) {
  const choices = DOCUMENT_PRESETS.map((item) => ({
    name: item.id,
    message: item.label,
    hint: item.help,
  }));
  const prompt = createSelectPrompt(
    {
      name: "document-preset",
      message: buildDocumentMessage({ profileId, baseDir }),
      choices,
    },
    selectFactory
  );
  const selectedId = await prompt.run();
  const selected = DOCUMENT_PRESETS.find((item) => item.id === selectedId) || null;
  if (!selected || selected.id === "back") {
    return null;
  }
  return {
    id: selected.id,
    formats: [...selected.formats],
  };
}

async function runInteractiveShell({
  profileId,
  baseDir,
  stdin = process.stdin,
  stdout = process.stdout,
  selectFactory,
} = {}) {
  const runtime = {
    isTTY: Boolean(stdin?.isTTY && stdout?.isTTY),
    width: Number(stdout?.columns || 0),
    height: Number(stdout?.rows || 0),
  };
  let state = createInitialUiState({
    profileContext: {
      profileId,
      baseDir,
    },
    runtime,
  });

  const choices = getHomeMenuItems().map((item) => ({
    name: item.id,
    message: item.label,
    hint: item.help,
  }));

  while (state.screen !== "exit") {
    const prompt = createSelectPrompt(
      {
        name: "home-action",
        message: buildHomeMessage({ profileId, baseDir }),
        choices,
      },
      selectFactory
    );

    let actionId;
    try {
      actionId = await prompt.run();
    } catch {
      state = reduceUiState(state, { type: "EXIT" });
      return {
        action: "exit",
        state,
      };
    }

    state = reduceUiState(state, {
      type: "SET_SELECTION",
      payload: { selectedAction: actionId },
    });

    const selected = getMenuItemById(actionId);
    if (!selected) {
      state = reduceUiState(state, {
        type: "SET_ERROR",
        payload: { message: `Opcao invalida recebida: ${actionId}` },
      });
      continue;
    }

    if (selected.id === "exit") {
      state = reduceUiState(state, { type: "EXIT" });
      return {
        action: "exit",
        state,
      };
    }

    if (selected.id === "generate-document") {
      try {
        const preset = await runDocumentPresetPrompt({
          profileId,
          baseDir,
          selectFactory,
        });
        if (!preset) {
          continue;
        }
        return {
          action: selected.id,
          exportPreset: preset.id,
          exportFormats: preset.formats,
          state,
        };
      } catch {
        state = reduceUiState(state, { type: "EXIT" });
        return {
          action: "exit",
          state,
        };
      }
    }

    return { action: selected.id, state };
  }

  return {
    action: "exit",
    state,
  };
}

module.exports = {
  shouldUseInteractiveShell,
  runInteractiveShell,
  OPERATIONAL_FLAGS,
};
