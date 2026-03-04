const DEFAULT_CONSENT_VERSION = "2026-03-03.v1";

function normalizeAnswer(input) {
  return String(input || "")
    .trim()
    .toLowerCase();
}

function isAcceptedAnswer(input) {
  const normalized = normalizeAnswer(input);
  return (
    normalized === "aceito" ||
    normalized === "sim" ||
    normalized === "s" ||
    normalized === "yes" ||
    normalized === "y"
  );
}

function hasValidConsent(profile, consentVersion) {
  const consent = profile?.meta?.consent;
  return Boolean(consent?.accepted && consent?.accepted_at && consent?.version === consentVersion);
}

async function ensureConsent({
  io,
  profile,
  consentVersion = DEFAULT_CONSENT_VERSION,
  consentSource = "cli",
}) {
  if (hasValidConsent(profile, consentVersion)) {
    return { granted: true, alreadyAccepted: true };
  }

  await io.say("");
  await io.say("Termo de consentimento informado");
  await io.say(
    "Este sistema coleta dados pessoais e psicologicos para montar um perfil mental estruturado."
  );
  await io.say("Voce pode encerrar a qualquer momento com /pause.");
  await io.say("Ao continuar, voce declara que entendeu o objetivo e concorda com a coleta.");

  const answer = await io.ask("Digite 'aceito' para continuar (qualquer outra resposta encerra): ");
  if (!isAcceptedAnswer(answer)) {
    await io.say("Consentimento nao concedido. Sessao encerrada.");
    return { granted: false, alreadyAccepted: false };
  }

  const now = new Date().toISOString();
  profile.meta.consent = {
    accepted: true,
    accepted_at: now,
    version: consentVersion,
    source: consentSource,
  };
  profile.meta.updated_at = now;
  await io.say("Consentimento registrado. Iniciando coleta.");

  return { granted: true, alreadyAccepted: false };
}

module.exports = {
  DEFAULT_CONSENT_VERSION,
  ensureConsent,
};
