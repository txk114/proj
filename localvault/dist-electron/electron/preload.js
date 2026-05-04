import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../src/types/ipc-types.js";
const api = {
    vaultExists: () => ipcRenderer.invoke(IPC_CHANNELS.vaultExists),
    loadVault: (request) => ipcRenderer.invoke(IPC_CHANNELS.loadVault, request),
    saveVault: (request) => ipcRenderer.invoke(IPC_CHANNELS.saveVault, request),
    copyToClipboard: (request) => ipcRenderer.invoke(IPC_CHANNELS.copyToClipboard, request),
    clearClipboard: (request) => ipcRenderer.invoke(IPC_CHANNELS.clearClipboard, request),
    onQuickSearch: (callback) => {
        const listener = () => callback();
        ipcRenderer.on(IPC_CHANNELS.quickSearch, listener);
        return () => ipcRenderer.removeListener(IPC_CHANNELS.quickSearch, listener);
    },
    closeQuickSearch: (request) => ipcRenderer.invoke(IPC_CHANNELS.quickSearchClose, request)
};
contextBridge.exposeInMainWorld("localVault", api);
