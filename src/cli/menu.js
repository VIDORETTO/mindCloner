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

async function runFromCliWithDeps(argv, deps = {}) {
  const args = parseArgs(argv);
  const ioFactory = deps.ioFactory || createTerminalIO;
  const runSessionFn = deps.runSessionFn || runSession;
  const sessionManagerFactory =
    deps.sessionManagerFactory || ((base, options) => new SessionManager(base, options));
  const loadPluginsFn = deps.loadPluginsFn || loadPlugins;
  const emitPluginEventFn = deps.emitPluginEventFn || emitPluginEvent;
  const loadTelemetryConfigFn = deps.loadTelemetryConfigFn || loadTelemetryConfig;
  const setTelemetryOptInFn = deps.setTelemetryOptInFn || setTelemetryOptIn;
  const trackTelemetryEventFn = deps.trackTelemetryEventFn || trackTelemetryEvent;
  const io = ioFactory();
  const baseDir = args.get("--baseDir") || path.join(os.homedir(), ".mindclone");
  const rawProfileId = args.get("--profile");
  const profileId = rawProfileId || `perfil-${Date.now()}`;
  const normalizedProfileId = slug(profileId);
  const deepeningMode = Boolean(args.get("--deepening"));
  const statusMode = Boolean(args.get("--status"));
  const resumeMode = Boolean(args.get("--resume"));
  const mirrorMode = Boolean(args.get("--mirror"));
  const compareArg = args.get("--compare");
  const importArg = args.get("--import");
  const journalArg = args.get("--journal");
  const telemetryArg = args.get("--telemetry");
  const exportArg = args.get("--export");
  const aiProvider = String(args.get("--provider") || process.env.MINDCLONE_AI_PROVIDER || "local");
  const aiModel = String(args.get("--ai-model") || process.env.MINDCLONE_AI_MODEL || "");
  const aiApiKey = String(args.get("--ai-key") || process.env.MINDCLONE_AI_API_KEY || "");
  const aiBaseUrl = String(args.get("--ai-base-url") || process.env.MINDCLONE_AI_BASE_URL || "");
  const aiTimeoutMs = Number(
    args.get("--ai-timeout") || process.env.MINDCLONE_AI_TIMEOUT_MS || 15000
  );
  const aiMaxRetries = Number(args.get("--ai-retries") || process.env.MINDCLONE_AI_RETRIES || 2);
  const encryptionKey = process.env.MINDCLONE_ENCRYPTION_KEY || "";
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
  await io.say(`Modo: ${deepeningMode ? "deepening" : "faseado"}`);
  await io.say(`Provider IA: ${aiProvider}`);
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
      requireConsent: true,
      consentSource: "cli",
      encryptionKey,
      requireEncryption: true,
      deepeningMode,
      aiProvider,
      aiModel,
      aiApiKey,
      aiBaseUrl,
      aiTimeoutMs,
      aiMaxRetries,
    });
  } catch (error) {
    if (/nenhuma chave foi fornecida|chave de criptografia ausente/i.test(String(error.message))) {
      throw new Error(
        "Dados criptografados detectados para este perfil. Defina MINDCLONE_ENCRYPTION_KEY para acessar dados existentes (status, resume ou execucao normal com perfil ja salvo)."
      );
    }
    throw error;
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
};
