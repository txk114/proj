import { app, BrowserWindow, clipboard, globalShortcut, ipcMain } from "electron";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { encryptVault, decryptVault, type EncryptedVaultFile } from "../src/lib/crypto.js";
import { IPC_CHANNELS, type CloseQuickSearchRequest, type CopyClipboardRequest, type LoadVaultRequest, type SaveVaultRequest } from "../src/types/ipc-types.js";
import { emptyVaultData, type VaultData } from "../src/types/vault.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined || !app.isPackaged;
let mainWindow: BrowserWindow | null = null;
let quickWindowState: {
  bounds: Electron.Rectangle;
  minimumSize: [number, number];
  wasFocused: boolean;
} | null = null;

const getVaultPath = (): string => {
  const vaultDir = path.join(app.getPath("userData"), "vault");
  mkdirSync(vaultDir, { recursive: true });
  return path.join(vaultDir, "localvault.json");
};

const parseVaultData = (raw: string): VaultData => {
  const parsed = JSON.parse(raw) as VaultData;
  return {
    entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    settings: {
      autoLockMinutes: parsed.settings?.autoLockMinutes ?? 5
    }
  };
};

const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    title: "LocalVault",
    backgroundColor: "#09090b",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow = win;
  win.on("closed", () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });

  if (isDev) {
    void win.loadURL("http://127.0.0.1:5173");
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

const openQuickSearch = (): void => {
  if (mainWindow === null) {
    createWindow();
  }
  if (mainWindow === null) return;
  if (quickWindowState === null) {
    const [minimumWidth, minimumHeight] = mainWindow.getMinimumSize();
    quickWindowState = {
      bounds: mainWindow.getBounds(),
      minimumSize: [minimumWidth, minimumHeight],
      wasFocused: mainWindow.isFocused()
    };
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.setMinimumSize(560, 120);
  mainWindow.setSize(640, 340);
  mainWindow.center();
  mainWindow.setAlwaysOnTop(true, "floating");
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.show();
  app.focus({ steal: true });
  mainWindow.focus();
  mainWindow.moveTop();
  mainWindow.webContents.focus();
  setTimeout(() => {
    mainWindow?.webContents.send(IPC_CHANNELS.quickSearch);
  }, 30);
};

const closeQuickSearch = (request?: CloseQuickSearchRequest): void => {
  if (mainWindow === null || quickWindowState === null) return;
  const state = quickWindowState;
  quickWindowState = null;
  mainWindow.setAlwaysOnTop(false);
  mainWindow.setVisibleOnAllWorkspaces(false);
  mainWindow.setMinimumSize(state.minimumSize[0], state.minimumSize[1]);
  mainWindow.setBounds(state.bounds);
  if (request?.hideWindow) {
    mainWindow.hide();
  } else if (state.wasFocused) {
    mainWindow.show();
    mainWindow.focus();
  } else {
    mainWindow.hide();
  }
};

ipcMain.handle(IPC_CHANNELS.vaultExists, (): boolean => existsSync(getVaultPath()));

ipcMain.handle(IPC_CHANNELS.loadVault, (_event, request: LoadVaultRequest) => {
  const vaultPath = getVaultPath();

  try {
    if (!existsSync(vaultPath)) {
      const newVault = emptyVaultData();
      writeFileSync(vaultPath, JSON.stringify(encryptVault(JSON.stringify(newVault), request.masterPassword), null, 2), "utf8");
      return { ok: true, data: newVault };
    }

    const payload = JSON.parse(readFileSync(vaultPath, "utf8")) as EncryptedVaultFile;
    const plainText = decryptVault(payload, request.masterPassword);
    return { ok: true, data: parseVaultData(plainText) };
  } catch {
    return { ok: false, error: "Wrong password" };
  }
});

ipcMain.handle(IPC_CHANNELS.saveVault, (_event, request: SaveVaultRequest) => {
  try {
    writeFileSync(getVaultPath(), JSON.stringify(encryptVault(JSON.stringify(request.vault), request.masterPassword), null, 2), "utf8");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to save vault" };
  }
});

ipcMain.handle(IPC_CHANNELS.copyToClipboard, (_event, request: CopyClipboardRequest) => {
  clipboard.writeText(request.text);
  return { ok: true };
});

ipcMain.handle(IPC_CHANNELS.clearClipboard, (_event, request: CopyClipboardRequest) => {
  if (clipboard.readText() === request.text) {
    clipboard.clear();
  }
  return { ok: true };
});

ipcMain.handle(IPC_CHANNELS.quickSearchClose, (_event, request?: CloseQuickSearchRequest) => {
  closeQuickSearch(request);
  return { ok: true };
});

app.whenReady().then(() => {
  createWindow();
  globalShortcut.register("CommandOrControl+Alt+P", openQuickSearch);
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
