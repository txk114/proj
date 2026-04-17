// Main Application Controller

document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    
    const loginForm = document.getElementById('login-form');
    const addForm = document.getElementById('add-form');
    const lockBtn = document.getElementById('lock-btn');
    const vaultList = document.getElementById('vault-list');

    let isUnlocked = false;

    // View Toggles
    const showDashboard = () => {
        loginView.classList.remove('active');
        dashboardView.classList.add('active');
    };

    const showLogin = () => {
        dashboardView.classList.remove('active');
        loginView.classList.add('active');
        document.getElementById('master-password').value = '';
    };

    // Event Listeners
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = document.getElementById('master-password').value;
        if(pwd.length > 0) {
            // TODO: derive key, verify signature of vault
            isUnlocked = true;
            showDashboard();
            renderVault();
        }
    });

    lockBtn.addEventListener('click', () => {
        isUnlocked = false;
        // clear any memory/state of the key here
        showLogin();
    });

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // TODO: Encrypt using crypto.js and save via storage.js
        console.log("Mock saved credential.");
        addForm.reset();
        renderVault();
    });

    // Render logic
    const renderVault = () => {
        // TODO: Read from storage.js and decrypt via crypto.js
        // For now, mockup an empty state.
        vaultList.innerHTML = '<p class="empty-state">No credentials saved yet.</p>';
    };
});
