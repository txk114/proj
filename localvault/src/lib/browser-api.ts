import type { IpcResult, LocalVaultApi, LoadVaultRequest, SaveVaultRequest, CopyClipboardRequest } from "../types/ipc-types";
import { emptyVaultData, type VaultData } from "../types/vault";

const STORAGE_KEY = "localvault.browser-preview";
const PASSWORD_KEY = "localvault.browser-preview.master";

const readVault = (): VaultData => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyVaultData();
  try {
    const parsed = JSON.parse(raw) as VaultData;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      settings: {
        autoLockMinutes: parsed.settings?.autoLockMinutes ?? 5
      }
    };
  } catch {
    return emptyVaultData();
  }
};

const writeVault = (vault: VaultData): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
};

const ok = <T>(data: T): IpcResult<T> => ({ ok: true, data });

export const installBrowserPreviewApi = (): void => {
  if (window.localVault) return;

  const api: LocalVaultApi = {
    vaultExists: async () => ok(window.localStorage.getItem(STORAGE_KEY) !== null),
    loadVault: async (request: LoadVaultRequest): Promise<IpcResult<VaultData>> => {
      const savedPassword = window.localStorage.getItem(PASSWORD_KEY);
      if (savedPassword !== null && savedPassword !== request.masterPassword) {
        return { ok: false, error: "Wrong password" };
      }
      window.localStorage.setItem(PASSWORD_KEY, request.masterPassword);
      const vault = readVault();
      writeVault(vault);
      return ok(vault);
    },
    saveVault: async (request: SaveVaultRequest): Promise<IpcResult<void>> => {
      window.localStorage.setItem(PASSWORD_KEY, request.masterPassword);
      writeVault(request.vault);
      return { ok: true };
    },
    copyToClipboard: async (request: CopyClipboardRequest): Promise<IpcResult<void>> => {
      await navigator.clipboard?.writeText(request.text);
      return { ok: true };
    },
    clearClipboard: async (_request: CopyClipboardRequest): Promise<IpcResult<void>> => ({ ok: true }),
    onQuickSearch: (callback: () => void): (() => void) => {
      const listener = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.altKey && event.key.toLowerCase() === "p") {
          event.preventDefault();
          callback();
        }
      };
      window.addEventListener("keydown", listener);
      return () => window.removeEventListener("keydown", listener);
    },
    closeQuickSearch: async (): Promise<IpcResult<void>> => ({ ok: true })
  };

  window.localVault = api;
};
