import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
const VERSION = 1;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BYTES = 32;
const TAG_BYTES = 16;
const ITERATIONS = 210_000;
const deriveKey = (masterPassword, salt) => pbkdf2Sync(masterPassword, salt, ITERATIONS, KEY_BYTES, "sha256");
export const encryptVault = (plainText, masterPassword) => {
    const salt = randomBytes(SALT_BYTES);
    const iv = randomBytes(IV_BYTES);
    const key = deriveKey(masterPassword, salt);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        version: VERSION,
        algorithm: "aes-256-gcm",
        kdf: "pbkdf2-sha256",
        iterations: ITERATIONS,
        salt: salt.toString("base64"),
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
        ciphertext: ciphertext.toString("base64")
    };
};
export const decryptVault = (payload, masterPassword) => {
    if (payload.version !== VERSION || payload.algorithm !== "aes-256-gcm") {
        throw new Error("Unsupported vault format");
    }
    const salt = Buffer.from(payload.salt, "base64");
    const iv = Buffer.from(payload.iv, "base64");
    const tag = Buffer.from(payload.tag, "base64");
    const ciphertext = Buffer.from(payload.ciphertext, "base64");
    const key = deriveKey(masterPassword, salt);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag.subarray(0, TAG_BYTES));
    const plainText = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plainText.toString("utf8");
};
