// Storage Manager
const StorageManager = {
    VAULT_KEY: 'local_vault_data',

    // Load whole encrypted vault
    loadVault: () => {
        const data = localStorage.getItem(StorageManager.VAULT_KEY);
        return data ? JSON.parse(data) : null;
    },

    // Save encrypted vault
    saveVault: (vaultPayload) => {
        // vaultPayload should be an object containing base64 strings of the salt, iv, and ciphertext
        localStorage.setItem(StorageManager.VAULT_KEY, JSON.stringify(vaultPayload));
    },

    // Check if vault is initialized
    isInitialized: () => {
        return localStorage.getItem(StorageManager.VAULT_KEY) !== null;
    }
};

window.StorageManager = StorageManager;
