// Web Crypto API wrapper (Stubbed)
const CryptoUtil = {
    // Generates AES-GCM Key from master password
    deriveKey: async (password, salt) => {
        console.log("Stub: deriving key for", password);
        return null; // Return KeyMaterial
    },

    // Encrypts plaintext string
    encrypt: async (plaintext, key) => {
        console.log("Stub: encrypting data...");
        return { cipher: "mock-cipher-text", iv: "mock-iv" };
    },

    // Decrypts ciphertext back to string
    decrypt: async (ciphertext, iv, key) => {
        console.log("Stub: decrypting data...");
        return "mock-plain-text";
    }
};

window.CryptoUtil = CryptoUtil;
