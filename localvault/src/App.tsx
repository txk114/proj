import { AnimatePresence, motion } from "framer-motion";
import { Lock, Settings, Shield, Vault, Wand2 } from "lucide-react";
import { Component, ErrorInfo, ReactNode, useCallback, useEffect } from "react";
import { Toasts } from "./components/Toast";
import { QuickSearchPalette } from "./components/QuickSearchPalette";
import { Button } from "./components/ui/button";
import { UnlockPage } from "./pages/UnlockPage";
import { VaultPage } from "./pages/VaultPage";
import { GeneratorPage } from "./pages/GeneratorPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useVaultStore } from "./store/vault-store";
import { CATEGORIES } from "./types/vault";
import { cn } from "./lib/utils";

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    this.setState({ hasError: true });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
          This panel hit an error. Lock and unlock the vault to refresh the app state.
        </div>
      );
    }
    return this.props.children;
  }
}

const Sidebar = ({ onLock }: { onLock: () => void }) => {
  const entries = useVaultStore((state) => state.entries);
  const activeCategory = useVaultStore((state) => state.activeCategory);
  const currentView = useVaultStore((state) => state.currentView);
  const setCategory = useVaultStore((state) => state.setCategory);
  const setView = useVaultStore((state) => state.setView);

  const navItemClass = (active: boolean) =>
    cn("flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm transition", active ? "bg-violet-500 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50");

  return (
    <aside className="fixed inset-y-0 left-0 flex w-[220px] flex-col border-r border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center gap-3 px-2 pt-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-50">LocalVault</p>
          <p className="text-xs text-zinc-500">{entries.length} items</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        <button type="button" className={navItemClass(currentView === "vault" && activeCategory === "All")} onClick={() => setCategory("All")}>
          <Vault className="h-4 w-4" />
          All Items
        </button>
        <div className="px-3 pb-1 pt-4 text-xs font-medium uppercase tracking-wide text-zinc-600">Categories</div>
        {CATEGORIES.map((category) => (
          <button key={category} type="button" className={navItemClass(currentView === "vault" && activeCategory === category)} onClick={() => setCategory(category)}>
            <span className="h-2 w-2 rounded-full bg-zinc-500" />
            {category}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-1">
        <button type="button" className={navItemClass(currentView === "generator")} onClick={() => setView("generator")}>
          <Wand2 className="h-4 w-4" />
          Generator
        </button>
        <button type="button" className={navItemClass(currentView === "settings")} onClick={() => setView("settings")}>
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <Button variant="ghost" className="mt-3 w-full justify-start" onClick={onLock}>
          <Lock className="h-4 w-4" />
          Lock
        </Button>
      </div>
    </aside>
  );
};

const Shell = () => {
  const currentView = useVaultStore((state) => state.currentView);
  const entries = useVaultStore((state) => state.entries);
  const settings = useVaultStore((state) => state.settings);
  const masterPassword = useVaultStore((state) => state.masterPassword);
  const isLocked = useVaultStore((state) => state.isLocked);
  const lastActivityAt = useVaultStore((state) => state.lastActivityAt);
  const lock = useVaultStore((state) => state.lock);
  const touch = useVaultStore((state) => state.touch);
  const vaultData = useVaultStore((state) => state.vaultData);
  const addToast = useVaultStore((state) => state.addToast);

  const saveVaultNow = useCallback(async () => {
    if (isLocked || !masterPassword) return;
    const result = await window.localVault.saveVault({ masterPassword, vault: vaultData() });
    if (!result.ok) {
      addToast({ variant: "error", title: "Vault save failed", message: result.error });
    }
  }, [addToast, isLocked, masterPassword, vaultData]);

  const saveAndLock = useCallback(() => {
    void saveVaultNow().finally(lock);
  }, [lock, saveVaultNow]);

  useEffect(() => {
    if (isLocked || !masterPassword) return;
    const timer = window.setTimeout(() => {
      void saveVaultNow();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [entries, settings, isLocked, masterPassword, saveVaultNow]);

  useEffect(() => {
    if (isLocked || !masterPassword) return;
    const flush = () => {
      void window.localVault.saveVault({ masterPassword, vault: vaultData() });
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [isLocked, masterPassword, vaultData]);

  useEffect(() => {
    if (isLocked) return;
    const events: Array<keyof WindowEventMap> = ["keydown", "mousedown", "mousemove", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, touch, { passive: true }));
    return () => events.forEach((event) => window.removeEventListener(event, touch));
  }, [isLocked, touch]);

  useEffect(() => {
    if (isLocked) return;
    const timer = window.setInterval(() => {
      const timeoutMs = settings.autoLockMinutes * 60_000;
      if (Date.now() - lastActivityAt >= timeoutMs) {
        saveAndLock();
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isLocked, lastActivityAt, saveAndLock, settings.autoLockMinutes]);

  const page = currentView === "settings" ? <SettingsPage /> : currentView === "generator" ? <GeneratorPage /> : <VaultPage />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Sidebar onLock={saveAndLock} />
      <main className="ml-[220px] h-screen overflow-y-auto p-8">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {page}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default function App() {
  const isLocked = useVaultStore((state) => state.isLocked);

  return (
    <>
      {isLocked ? <UnlockPage /> : <Shell />}
      <QuickSearchPalette />
      <Toasts />
    </>
  );
}
