import type { VaultData } from "./vault.js";

export const IPC_CHANNELS = {
  vaultExists: "vault:exists",
  loadVault: "vault:load",
  saveVault: "vault:save",
  copyToClipboard: "clipboard:copy",
  clearClipboard: "clipboard:clear",
  quickSearch: "quick-search:open",
  quickSearchClose: "quick-search:close"
} as const;

export interface IpcResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface LoadVaultRequest {
  masterPassword: string;
}

export interface SaveVaultRequest {
  masterPassword: string;
  vault: VaultData;
}

export interface CopyClipboardRequest {
  text: string;
}

export interface CloseQuickSearchRequest {
  hideWindow?: boolean;
}

export interface LocalVaultApi {
  vaultExists: () => Promise<IpcResult<boolean>>;
  loadVault: (request: LoadVaultRequest) => Promise<IpcResult<VaultData>>;
  saveVault: (request: SaveVaultRequest) => Promise<IpcResult<void>>;
  copyToClipboard: (request: CopyClipboardRequest) => Promise<IpcResult<void>>;
  clearClipboard: (request: CopyClipboardRequest) => Promise<IpcResult<void>>;
  onQuickSearch: (callback: () => void) => () => void;
  closeQuickSearch: (request?: CloseQuickSearchRequest) => Promise<IpcResult<void>>;
}

declare global {
  interface Window {
    localVault: LocalVaultApi;
  }
}
