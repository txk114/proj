// Main Application Controller
document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    
    const loginForm = document.getElementById('login-form');
    const addForm = document.getElementById('add-form');
    const lockBtn = document.getElementById('lock-btn');
    const vaultList = document.getElementById('vault-list');
    const loginError = document.getElementById('login-error');

    let currentKey = null;
    let currentVault = [];
    let currentSalt = null;

    // View Toggles
    const showDashboard = () => {
        loginView.classList.remove('active');
        dashboardView.classList.add('active');
        loginError.classList.remove('show');
    };

    const showLogin = () => {
        dashboardView.classList.remove('active');
        loginView.classList.add('active');
        document.getElementById('master-password').value = '';
    };

    const showError = (msg) => {
        loginError.textContent = msg;
        loginError.classList.add('show');
    };

    // Login Flow
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = document.getElementById('master-password').value;
        const submitBtn = document.getElementById('login-submit-btn');
        submitBtn.disabled = true;
        loginError.classList.remove('show');

        try {
            if (StorageManager.isInitialized()) {
                // Load existing
                const vaultPayload = StorageManager.loadVault();
                currentSalt = CryptoUtil.base64ToBuf(vaultPayload.salt);
                const iv = CryptoUtil.base64ToBuf(vaultPayload.iv);
                const ciphertext = CryptoUtil.base64ToBuf(vaultPayload.ciphertext);

                currentKey = await CryptoUtil.deriveKey(pwd, currentSalt);
                
                try {
                    const decryptedStr = await CryptoUtil.decrypt(ciphertext, iv, currentKey);
                    currentVault = JSON.parse(decryptedStr);
                    showDashboard();
                    renderVault();
                } catch (err) {
                    showError("Incorrect master password.");
                }
            } else {
                // Initialize new vault
                currentSalt = CryptoUtil.generateRandomBuffer(16);
                currentKey = await CryptoUtil.deriveKey(pwd, currentSalt);
                currentVault = [];
                await persistVault();
                showDashboard();
                renderVault();
            }
        } catch (err) {
            console.error(err);
            showError("An error occurred during authentication.");
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Lock Flow
    lockBtn.addEventListener('click', () => {
        currentKey = null;
        currentVault = [];
        currentSalt = null;
        showLogin();
    });

    // Save Vault Flow
    const persistVault = async () => {
        if (!currentKey) return;
        const plaintext = JSON.stringify(currentVault);
        const { ciphertext, iv } = await CryptoUtil.encrypt(plaintext, currentKey);
        
        StorageManager.saveVault({
            salt: CryptoUtil.bufToBase64(currentSalt),
            iv: CryptoUtil.bufToBase64(iv),
            ciphertext: CryptoUtil.bufToBase64(ciphertext)
        });
    };

    // Add Credential Flow
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const site = document.getElementById('site-name').value;
        const username = document.getElementById('site-username').value;
        const password = document.getElementById('site-password').value;

        currentVault.push({ site, username, password });
        await persistVault();

        addForm.reset();
        renderVault();
    });

    // Make copy functional globally
    window.copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // Optional: could show a little toast here
        });
    };

    // Render logic
    const renderVault = () => {
        if (currentVault.length === 0) {
            vaultList.innerHTML = '<p class="empty-state">No credentials saved yet.</p>';
            return;
        }

        vaultList.innerHTML = currentVault.map((item, index) => `
            <div class="vault-item">
                <div class="vault-item-details">
                    <strong>${item.site}</strong>
                    <span>${item.username}</span>
                </div>
                <div class="actions">
                    <button type="button" class="copy-btn" onclick="copyToClipboard('${item.password}')" title="Copy Password">
                        📋 Copy
                    </button>
                </div>
            </div>
        `).join('');
    };
});
