const crypto = require("node:crypto");

const ENCRYPTION_VERSION = 1;
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const KDF_ALGORITHM = "scrypt";
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

function isEncryptedPayload(payload) {
  return Boolean(
    payload &&
    typeof payload === "object" &&
    payload.__encrypted === true &&
    payload.v === ENCRYPTION_VERSION &&
    typeof payload.data === "string"
  );
}

function deriveKey(keyMaterial, salt) {
  return crypto.scryptSync(keyMaterial, salt, 32, SCRYPT_PARAMS);
}

function encryptText(plainText, keyMaterial) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(keyMaterial, salt);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    __encrypted: true,
    v: ENCRYPTION_VERSION,
    alg: ENCRYPTION_ALGORITHM,
    kdf: KDF_ALGORITHM,
    scrypt: SCRYPT_PARAMS,
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64"),
  };
}

function decryptText(payload, keyMaterial) {
  try {
    const salt = Buffer.from(payload.salt, "base64");
    const iv = Buffer.from(payload.iv, "base64");
    const tag = Buffer.from(payload.tag, "base64");
    const encrypted = Buffer.from(payload.data, "base64");
    const key = deriveKey(keyMaterial, salt);
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return plain.toString("utf8");
  } catch {
    throw new Error(
      "Falha ao descriptografar dados sensiveis: chave invalida ou arquivo corrompido."
    );
  }
}

module.exports = {
  isEncryptedPayload,
  encryptText,
  decryptText,
};
