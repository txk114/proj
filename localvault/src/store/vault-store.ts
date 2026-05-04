import { create } from "zustand";
import type { VaultData, VaultEntry, VaultSettings, VaultCategory } from "../types/vault";
import { emptyVaultData } from "../types/vault";

type ToastVariant = "success" | "error" | "info" | "warning";
type ViewName = "vault" | "generator" | "settings";

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
}

interface VaultState {
  entries: VaultEntry[];
  settings: VaultSettings;
  masterPassword: string;
  isLocked: boolean;
  selectedEntryId: string | null;
  activeCategory: VaultCategory | "All";
  search: string;
  currentView: ViewName;
  toasts: ToastMessage[];
  lastActivityAt: number;
  setSearch: (search: string) => void;
  setCategory: (category: VaultCategory | "All") => void;
  setView: (view: ViewName) => void;
  setSelectedEntry: (id: string | null) => void;
  unlock: (masterPassword: string, vault: VaultData) => void;
  lock: () => void;
  touch: () => void;
  addEntry: (entry: VaultEntry) => void;
  updateEntry: (entry: VaultEntry) => void;
  deleteEntry: (id: string) => void;
  updateSettings: (settings: VaultSettings) => void;
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  dismissToast: (id: string) => void;
  vaultData: () => VaultData;
}

const newId = (): string => crypto.randomUUID();

export const useVaultStore = create<VaultState>((set, get) => ({
  entries: [],
  settings: emptyVaultData().settings,
  masterPassword: "",
  isLocked: true,
  selectedEntryId: null,
  activeCategory: "All",
  search: "",
  currentView: "vault",
  toasts: [],
  lastActivityAt: Date.now(),
  setSearch: (search) => set({ search }),
  setCategory: (activeCategory) => set({ activeCategory, currentView: "vault" }),
  setView: (currentView) => set({ currentView, selectedEntryId: null }),
  setSelectedEntry: (selectedEntryId) => set({ selectedEntryId }),
  unlock: (masterPassword, vault) =>
    set({
      entries: vault.entries,
      settings: vault.settings,
      masterPassword,
      isLocked: false,
      selectedEntryId: null,
      currentView: "vault",
      lastActivityAt: Date.now()
    }),
  lock: () =>
    set({
      entries: [],
      masterPassword: "",
      isLocked: true,
      selectedEntryId: null,
      search: "",
      activeCategory: "All",
      currentView: "vault"
    }),
  touch: () => set({ lastActivityAt: Date.now() }),
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
  updateEntry: (entry) =>
    set((state) => ({
      entries: state.entries.map((item) => (item.id === entry.id ? entry : item))
    })),
  deleteEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((item) => item.id !== id),
      selectedEntryId: state.selectedEntryId === id ? null : state.selectedEntryId
    })),
  updateSettings: (settings) => set({ settings }),
  addToast: (toast) => {
    const id = newId();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),
  vaultData: () => ({
    entries: get().entries,
    settings: get().settings
  })
}));
