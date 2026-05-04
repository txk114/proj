import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, type CloseQuickSearchRequest, type CopyClipboardRequest, type LoadVaultRequest, type LocalVaultApi, type SaveVaultRequest } from "../src/types/ipc-types.js";

const api: LocalVaultApi = {
  vaultExists: () => ipcRenderer.invoke(IPC_CHANNELS.vaultExists),
  loadVault: (request: LoadVaultRequest) => ipcRenderer.invoke(IPC_CHANNELS.loadVault, request),
  saveVault: (request: SaveVaultRequest) => ipcRenderer.invoke(IPC_CHANNELS.saveVault, request),
  copyToClipboard: (request: CopyClipboardRequest) => ipcRenderer.invoke(IPC_CHANNELS.copyToClipboard, request),
  clearClipboard: (request: CopyClipboardRequest) => ipcRenderer.invoke(IPC_CHANNELS.clearClipboard, request),
  onQuickSearch: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on(IPC_CHANNELS.quickSearch, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.quickSearch, listener);
  },
  closeQuickSearch: (request?: CloseQuickSearchRequest) => ipcRenderer.invoke(IPC_CHANNELS.quickSearchClose, request)
};

contextBridge.exposeInMainWorld("localVault", api);
