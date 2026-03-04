const os = require("node:os");
const path = require("node:path");
const { createTerminalIO } = require("./interface");
const { runSession } = require("../index");
const { exportProfileBundle, normalizeFormats } = require("../profile/profile-exporter");
const { SessionManager } = require("../storage/session-manager");
const { appendJournalEntry, normalizeTags, readJournalEntries } = require("../ops/journal");
const { buildMirrorText } = require("../ops/mirror");
const { importExternalProfile } = require("../ops/importer");
const { buildProfileComparison } = require("../ops/compare");
const { loadPlugins, emitPluginEvent } = require("../ops/plugins");
const { loadTelemetryConfig, setTelemetryOptIn, trackTelemetryEvent } = require("../ops/telemetry");
const { runInteractiveShell, shouldUseInteractiveShell } = require("./tui-shell");
const { SettingsManager } = require("../config/settings-manager");
const { runSetupWizard } = require("./setup-wizard");

function parseArgs(argv) {
  const args = new Map();
  for (let i = 2; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];
    if (current.startsWith("--")) {
      if (next && !next.startsWith("--")) {
        args.set(current, next);
        i += 1;
      } else {
        args.set(current, true);
      }
    }
  }
  return args;
}

function slug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function runFromCli(argv) {
  return runFromCliWithDeps(argv, {});
}

function formatStatus(state, profile) {
  const phase = state.current_phase || 1;
  const progress = Number(state.current_phase_progress || 0).toFixed(0);
  const overall = Number(state.overall_progress || 0).toFixed(0);
  const completeness = Number(profile.meta?.completeness_score || 0).toFixed(2);
  const questions = state.total_questions || 0;
  const sessions = profile.meta?.total_sessions || 0;
  const lastPhase = profile.meta?.last_phase || "-";
  return [
    "Status atual:",
    `- Fase atual: ${phase} (${progress}%)`,
    `- Progresso geral: ${overall}%`,
    `- Completude: ${completeness}%`,
    `- Perguntas respondidas: ${questions}`,
    `- Sessoes concluidas: ${sessions}`,
    `- Ultima fase registrada: ${lastPhase}`,
  ].join("\n");
}

function buildProfileNotFoundMessage(profileId, baseDir) {
  return `Perfil nao encontrado: "${profileId}" em "${baseDir}". Use --profile <id> com um perfil existente ou rode sem --resume para criar um novo.`;
}

function parseCompareProfileIds(compareArg, normalizedProfileId, rawProfileId) {
  if (!compareArg || compareArg === true) {
    throw new Error(
      "Use --compare <outroPerfil> com --profile <id> ou --compare <perfilA,perfilB>."
    );
  }
  const parts = String(compareArg)
    .split(",")
    .map((item) => slug(item))
    .filter(Boolean);
  if (parts.length >= 2) {
    return [parts[0], parts[1]];
  }
  if (!rawProfileId) {
    throw new Error("Para comparar um perfil alvo unico, informe tambem --profile <id>.");
  }
  return [normalizedProfileId, parts[0]];
}

function applyInteractiveAction(args, action) {
  if (action === "continue-interview") {
    args.set("--resume", true);
    return;
  }
  if (action === "diagnostics") {
    args.set("--status", true);
    return;
  }
  if (action === "generate-document") {
    args.set("--status", true);
    if (!args.get("--export")) {
      args.set("--export", true);
    }
  }
}

function isTerminalInteractive(stdin, stdout) {
  return Boolean(stdin?.isTTY && stdout?.isTTY);
}

async function runFromCliWithDeps(argv, deps = {}) {
  const args = parseArgs(argv);
  const stdin = deps.stdin || process.stdin;
  const stdout = deps.stdout || process.stdout;
  const ioFactory = deps.ioFactory || (() => createTerminalIO({ input: stdin, output: stdout }));
  const runSessionFn = deps.runSessionFn || runSession;
  const runInteractiveShellFn = deps.tuiRunner || runInteractiveShell;
  const shouldUseInteractiveShellFn = deps.shouldUseInteractiveShellFn || shouldUseInteractiveShell;
  const setupWizardFn = deps.setupWizardFn || runSetupWizard;
  const sessionManagerFactory =
    deps.sessionManagerFactory || ((base, options) => new SessionManager(base, options));
  const settingsManagerFactory =
    deps.settingsManagerFactory || ((base, options) => new SettingsManager(base, options));
  const loadPluginsFn = deps.loadPluginsFn || loadPlugins;
  const emitPluginEventFn = deps.emitPluginEventFn || emitPluginEvent;
  const loadTelemetryConfigFn = deps.loadTelemetryConfigFn || loadTelemetryConfig;
  const setTelemetryOptInFn = deps.setTelemetryOptInFn || setTelemetryOptIn;
  const trackTelemetryEventFn = deps.trackTelemetryEventFn || trackTelemetryEvent;
  const encryptionKey = process.env.MINDCLONE_ENCRYPTION_KEY || "";
  let baseDir = args.get("--baseDir") || path.join(os.homedir(), ".mindclone");
  let settingsManager = settingsManagerFactory(baseDir, { encryptionKey });
  let loadedSettings = await settingsManager.loadSettings();
  let settings = loadedSettings.settings;
  let settingsExists = loadedSettings.exists;
  if (!args.get("--baseDir") && settings.baseDir && settings.baseDir !== baseDir) {
    baseDir = settings.baseDir;
    settingsManager = settingsManagerFactory(baseDir, { encryptionKey });
    loadedSettings = await settingsManager.loadSettings();
    settings = loadedSettings.settings;
    settingsExists = loadedSettings.exists;
  }

  const explicitSetupMode = Boolean(args.get("--setup"));
  const interactiveEnabled = shouldUseInteractiveShellFn({ args, stdin, stdout });
  const settingsWarnings = [];
  let sessionApiKey = "";

  const runWizardAndPersist = async (mode, profileIdHint) => {
    const wizardResult = await setupWizardFn({
      mode,
      initialSettings: settings,
      baseDir,
      profileIdHint,
    });
    if (!wizardResult || !wizardResult.settings) {
      throw new Error("Setup cancelado: configuracoes invalidas retornadas pelo wizard.");
    }
    const selectedBaseDir = String(wizardResult.settings.baseDir || baseDir).trim() || baseDir;
    if (selectedBaseDir !== baseDir) {
      baseDir = selectedBaseDir;
      settingsManager = settingsManagerFactory(baseDir, { encryptionKey });
    }
    settings = await settingsManager.saveSettings(wizardResult.settings);
    settingsExists = true;
    if (wizardResult.openaiApiKey) {
      try {
        await settingsManager.saveSecrets({ openaiApiKey: wizardResult.openaiApiKey });
      } catch (error) {
        sessionApiKey = String(wizardResult.openaiApiKey || "");
        settingsWarnings.push(
          `${error.message} A chave informada sera usada apenas nesta execucao atual.`
        );
      }
    }
  };

  if (explicitSetupMode && !isTerminalInteractive(stdin, stdout)) {
    throw new Error("O modo --setup exige terminal interativo (TTY).");
  }

  if ((interactiveEnabled && !settingsExists) || explicitSetupMode) {
    await runWizardAndPersist("first-use", args.get("--profile") || settings.defaultProfileId);
    if (explicitSetupMode && !interactiveEnabled) {
      const setupIo = ioFactory();
      await setupIo.say("Setup concluido com sucesso.");
      await setupIo.close();
      return;
    }
  }

  let rawProfileId = args.get("--profile") || settings.defaultProfileId || `perfil-${Date.now()}`;
  let normalizedProfileId = slug(rawProfileId);

  if (interactiveEnabled) {
    while (true) {
      const interactive = await runInteractiveShellFn({
        profileId: normalizedProfileId,
        baseDir,
        stdin,
        stdout,
      });
      if (!interactive || interactive.action === "exit") {
        return;
      }
      if (interactive.action === "settings") {
        await runWizardAndPersist("edit", rawProfileId);
        rawProfileId = args.get("--profile") || settings.defaultProfileId || rawProfileId;
        normalizedProfileId = slug(rawProfileId);
        continue;
      }
      applyInteractiveAction(args, interactive.action);
      break;
    }
  }

  rawProfileId = args.get("--profile") || settings.defaultProfileId || rawProfileId;
  const profileId = rawProfileId || `perfil-${Date.now()}`;
  normalizedProfileId = slug(profileId);
  const io = ioFactory();
  const deepeningMode = Boolean(args.get("--deepening"));
  const statusMode = Boolean(args.get("--status"));
  const resumeMode = Boolean(args.get("--resume"));
  const mirrorMode = Boolean(args.get("--mirror"));
  const compareArg = args.get("--compare");
  const importArg = args.get("--import");
  const journalArg = args.get("--journal");
  const telemetryArg = args.get("--telemetry");
  const exportArg = args.get("--export");
  const interviewModeInput = String(
    args.get("--interview-mode") || settings.interview?.defaultMode || "adaptive"
  ).toLowerCase();
  const interviewMode = interviewModeInput === "phased" ? "phased" : "adaptive";
  const maxQuestionsInput = Number(
    args.get("--max-questions") || settings.interview?.maxQuestionsPerSession || 25
  );
  const maxQuestions =
    Number.isFinite(maxQuestionsInput) && maxQuestionsInput > 0
      ? Math.round(maxQuestionsInput)
      : 25;
  let secretsApiKey = "";
  try {
    const loadedSecrets = await settingsManager.loadSecrets();
    secretsApiKey = loadedSecrets.secrets.openaiApiKey;
  } catch (error) {
    settingsWarnings.push(error.message);
  }

  const aiProvider = String(
    args.get("--provider") || process.env.MINDCLONE_AI_PROVIDER || settings.ai?.provider || "local"
  );
  const aiModel = String(
    args.get("--ai-model") || process.env.MINDCLONE_AI_MODEL || settings.ai?.model || ""
  );
  const aiApiKey = String(
    settingsManager.resolveApiKey({
      envApiKey: process.env.MINDCLONE_AI_API_KEY,
      cliApiKey: args.get("--ai-key"),
      secretsApiKey: sessionApiKey || secretsApiKey,
    })
  );
  const aiBaseUrl = String(args.get("--ai-base-url") || process.env.MINDCLONE_AI_BASE_URL || "");
  const aiTimeoutMs = Number(
    args.get("--ai-timeout") ||
      process.env.MINDCLONE_AI_TIMEOUT_MS ||
      settings.ai?.timeoutMs ||
      15000
  );
  const aiMaxRetries = Number(
    args.get("--ai-retries") || process.env.MINDCLONE_AI_RETRIES || settings.ai?.maxRetries || 2
  );
  const sessionManager = sessionManagerFactory(baseDir, {
    encryptionKey,
    requireEncryption: false,
  });

  const plugins = loadPluginsFn(args.get("--plugin"), process.cwd());

  const notifyPlugins = async (eventName, extra = {}) => {
    await emitPluginEventFn(plugins, eventName, {
      args,
      profileId: normalizedProfileId,
      baseDir,
      io,
      ...extra,
    });
  };

  const telemetryTrack = async (name, attrs = {}) => {
    await trackTelemetryEventFn(sessionManager, {
      name,
      profileId: normalizedProfileId,
      attrs,
    });
  };

  await io.say("MindClone CLI");
  await io.say(`Perfil: ${normalizedProfileId}`);
  await io.say(`Modo: ${deepeningMode ? "deepening" : interviewMode}`);
  await io.say(`Provider IA: ${aiProvider}`);
  for (const warning of settingsWarnings) {
    await io.say(`[Aviso] ${warning}`);
  }
  if (plugins.length > 0) {
    await io.say(`Plugins carregados: ${plugins.map((item) => item.name).join(", ")}`);
  }
  await notifyPlugins("cli:start", { mode: "bootstrap" });

  if (telemetryArg) {
    const action = String(telemetryArg === true ? "status" : telemetryArg)
      .toLowerCase()
      .trim();
    if (!["on", "off", "status"].includes(action)) {
      throw new Error("Valor invalido para --telemetry. Use: on, off ou status.");
    }
    if (action === "status") {
      const telemetry = await loadTelemetryConfigFn(sessionManager);
      await io.say(`Telemetria opt-in: ${telemetry.data.opt_in ? "ON" : "OFF"}`);
      await io.say(`Eventos registrados: ${telemetry.data.events.length}`);
      await io.close();
      return;
    }
    const updated = await setTelemetryOptInFn(sessionManager, action === "on");
    await io.say(`Telemetria atualizada: ${updated.opt_in ? "ON" : "OFF"}`);
    await io.close();
    return;
  }

  if (resumeMode && !rawProfileId) {
    throw new Error("Para usar --resume, informe um perfil com --profile <id>.");
  }

  if (statusMode) {
    const loaded = await sessionManager.loadExisting(normalizedProfileId);
    if (!loaded) {
      throw new Error(buildProfileNotFoundMessage(normalizedProfileId, baseDir));
    }
    await io.say(`\n${formatStatus(loaded.state, loaded.profile)}`);
    if (exportArg) {
      const formats =
        exportArg === true
          ? ["json", "markdown", "summary", "rag-chunks"]
          : normalizeFormats(exportArg);
      const exported = await exportProfileBundle({
        baseDir,
        profileId: normalizedProfileId,
        profile: loaded.profile,
        state: loaded.state,
        formats,
      });
      await io.say(`\nExportacao concluida em: ${exported.outputDir}`);
      for (const [format, file] of Object.entries(exported.files)) {
        await io.say(`- ${format}: ${file}`);
      }
    }
    await telemetryTrack("cli.status", { export: Boolean(exportArg) });
    await notifyPlugins("cli:status", { state: loaded.state, profile: loaded.profile });
    await io.close();
    return;
  }

  if (mirrorMode) {
    const loaded = await sessionManager.loadExisting(normalizedProfileId);
    if (!loaded) {
      throw new Error(buildProfileNotFoundMessage(normalizedProfileId, baseDir));
    }
    const journalEntries = await readJournalEntries({
      sessionManager,
      profileId: normalizedProfileId,
      limit: 2,
    });
    await io.say(
      `\n${buildMirrorText({ profile: loaded.profile, state: loaded.state, journalEntries })}`
    );
    await telemetryTrack("cli.mirror");
    await notifyPlugins("cli:mirror", {
      state: loaded.state,
      profile: loaded.profile,
      journalEntries,
    });
    await io.close();
    return;
  }

  if (journalArg) {
    await sessionManager.loadOrCreate(normalizedProfileId);
    const text =
      journalArg === true
        ? typeof io.ask === "function"
          ? (await io.ask("Registro do diario: ")).trim()
          : ""
        : String(journalArg).trim();
    if (!text) {
      throw new Error("Use --journal <texto> para registrar uma entrada de diario.");
    }
    const tags = normalizeTags(args.get("--journal-tags"));
    const result = await appendJournalEntry({
      sessionManager,
      profileId: normalizedProfileId,
      text,
      tags,
      source: "cli",
    });
    await io.say(`Entrada registrada no diario (${result.total} total).`);
    await telemetryTrack("cli.journal", {
      tags_count: tags.length,
    });
    await notifyPlugins("cli:journal", { journalEntry: result.entry });
    await io.close();
    return;
  }

  if (importArg) {
    const imported = await importExternalProfile({
      sessionManager,
      profileId: normalizedProfileId,
      importPath: String(importArg),
    });
    await io.say(`Importacao concluida para perfil "${normalizedProfileId}".`);
    await io.say(
      `Completude atual: ${Number(imported.profile.meta?.completeness_score || 0).toFixed(2)}%`
    );
    await telemetryTrack("cli.import");
    await notifyPlugins("cli:import", { state: imported.state, profile: imported.profile });
    await io.close();
    return;
  }

  if (compareArg) {
    const [leftProfileId, rightProfileId] = parseCompareProfileIds(
      compareArg,
      normalizedProfileId,
      rawProfileId
    );
    const leftLoaded = await sessionManager.loadExisting(leftProfileId);
    const rightLoaded = await sessionManager.loadExisting(rightProfileId);
    if (!leftLoaded) {
      throw new Error(buildProfileNotFoundMessage(leftProfileId, baseDir));
    }
    if (!rightLoaded) {
      throw new Error(buildProfileNotFoundMessage(rightProfileId, baseDir));
    }
    const report = buildProfileComparison({
      leftProfile: leftLoaded.profile,
      leftState: leftLoaded.state,
      rightProfile: rightLoaded.profile,
      rightState: rightLoaded.state,
      leftId: leftProfileId,
      rightId: rightProfileId,
    });
    await io.say(`\n${report}`);
    await telemetryTrack("cli.compare");
    await notifyPlugins("cli:compare", {
      leftProfileId,
      rightProfileId,
      left: leftLoaded,
      right: rightLoaded,
    });
    await io.close();
    return;
  }

  if (resumeMode) {
    const loaded = await sessionManager.loadExisting(normalizedProfileId);
    if (!loaded) {
      throw new Error(buildProfileNotFoundMessage(normalizedProfileId, baseDir));
    }
    await io.say(`Retomando sessao existente do perfil "${normalizedProfileId}".`);
  }

  let result;
  try {
    result = await runSessionFn({
      profileId: normalizedProfileId,
      baseDir,
      io,
      maxQuestions,
      requireConsent: true,
      consentSource: "cli",
      encryptionKey,
      requireEncryption: false,
      deepeningMode,
      interviewMode,
      aiProvider,
      aiModel,
      aiApiKey,
      aiBaseUrl,
      aiTimeoutMs,
      aiMaxRetries,
    });
  } catch (error) {
    if (/nenhuma chave foi fornecida|chave de criptografia ausente/i.test(String(error.message))) {
      const suggestedProfile = `${normalizedProfileId}-novo`;
      throw new Error(
        `Dados criptografados detectados para este perfil. Defina MINDCLONE_ENCRYPTION_KEY para acessar dados existentes (status, resume ou execucao normal com perfil ja salvo). Se voce nunca configurou chave e so quer comecar agora, use um perfil novo, por exemplo: --profile ${suggestedProfile}`
      );
    }
    throw error;
  }

  if (result.returnToMenu) {
    await io.say("\nRetornando ao menu principal...");
    await io.close();
    if (interactiveEnabled) {
      return runFromCliWithDeps(argv, deps);
    }
    return;
  }

  if (exportArg) {
    const formats =
      exportArg === true
        ? ["json", "markdown", "summary", "rag-chunks"]
        : normalizeFormats(exportArg);
    const exported = await exportProfileBundle({
      baseDir,
      profileId: normalizedProfileId,
      profile: result.profile,
      state: result.state,
      formats,
    });
    await io.say(`\nExportacao concluida em: ${exported.outputDir}`);
    for (const [format, file] of Object.entries(exported.files)) {
      await io.say(`- ${format}: ${file}`);
    }
  }

  await io.say(`\nResumo da fase: ${result.summary}`);
  await telemetryTrack("cli.session", {
    deepening: deepeningMode,
    resumed: resumeMode,
  });
  await notifyPlugins("cli:session-finished", { result });
  await io.close();
}

module.exports = {
  runFromCli,
  runFromCliWithDeps,
  parseArgs,
  slug,
  parseCompareProfileIds,
  applyInteractiveAction,
};
