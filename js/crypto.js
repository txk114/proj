// Web Crypto API wrapper
const CryptoUtil = {
    // Generates a cryptographically strong random salt or IV
    generateRandomBuffer: (length) => {
        return crypto.getRandomValues(new Uint8Array(length));
    },

    // Generates AES-GCM Key from master password using PBKDF2
    deriveKey: async (password, saltUint8) => {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        return await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: saltUint8,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    },

    // Encrypts plaintext string returning { ciphertext, iv } as Uint8Arrays
    encrypt: async (plaintext, key) => {
        const iv = CryptoUtil.generateRandomBuffer(12); // Standard IV size for AES-GCM
        const encoder = new TextEncoder();
        
        const cipherBuffer = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encoder.encode(plaintext)
        );
        return {
            ciphertext: new Uint8Array(cipherBuffer),
            iv: iv
        };
    },

    // Decrypts ciphertext Uint8Array back to string
    decrypt: async (ciphertext, iv, key) => {
        const plainBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            ciphertext
        );
        const decoder = new TextDecoder();
        return decoder.decode(plainBuffer);
    },

    // Utilities to convert between Uint8Array and Base64 string for storage
    bufToBase64: (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },

    base64ToBuf: (b64) => {
        const binary_string = window.atob(b64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }
};

window.CryptoUtil = CryptoUtil;
