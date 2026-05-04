export type VaultCategory = "Social" | "Work" | "Finance" | "Email" | "Dev" | "Other";

export interface VaultEntry {
  id: string;
  siteName: string;
  url: string;
  username: string;
  password: string;
  notes: string;
  category: VaultCategory;
  createdAt: string;
  updatedAt: string;
}

export interface VaultSettings {
  autoLockMinutes: number;
}

export interface VaultData {
  entries: VaultEntry[];
  settings: VaultSettings;
}

export const CATEGORIES: VaultCategory[] = ["Social", "Work", "Finance", "Email", "Dev", "Other"];

export const emptyVaultData = (): VaultData => ({
  entries: [],
  settings: {
    autoLockMinutes: 5
  }
});
