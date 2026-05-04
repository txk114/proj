import { AnimatePresence, motion } from "framer-motion";
import { Check, KeyRound, Lock, Search } from "lucide-react";
import { FormEvent, KeyboardEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { scorePassword } from "../lib/strength";
import { cn } from "../lib/utils";
import { useVaultStore } from "../store/vault-store";
import type { VaultEntry } from "../types/vault";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const matchEntry = (entry: VaultEntry, query: string): boolean => {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return true;
  return [entry.siteName, entry.username, entry.url, entry.category].some((value) => value.toLowerCase().includes(normalized));
};

export const QuickSearchPalette = () => {
  const entries = useVaultStore((state) => state.entries);
  const isLocked = useVaultStore((state) => state.isLocked);
  const addToast = useVaultStore((state) => state.addToast);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const focusSearch = useCallback(() => {
    if (isLocked) return;
    window.focus();
    inputRef.current?.focus({ preventScroll: true });
    inputRef.current?.select();
  }, [isLocked]);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (node && open && !isLocked) {
        queueMicrotask(focusSearch);
      }
    },
    [focusSearch, isLocked, open]
  );

  useEffect(() => {
    return window.localVault.onQuickSearch(() => {
      setOpen(true);
      setQuery("");
      setSelectedIndex(0);
      window.setTimeout(focusSearch, 0);
    });
  }, [focusSearch]);

  useLayoutEffect(() => {
    if (open) {
      focusSearch();
    }
  }, [focusSearch, open]);

  useEffect(() => {
    if (!open) return;
    focusSearch();
    const animationFrame = window.requestAnimationFrame(focusSearch);
    const timers = [20, 80, 180].map((delay) => window.setTimeout(focusSearch, delay));
    return () => {
      window.cancelAnimationFrame(animationFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [focusSearch, open]);

  const matches = useMemo(() => entries.filter((entry) => matchEntry(entry, query)).slice(0, 8), [entries, query]);
  const selected = matches[selectedIndex] ?? matches[0] ?? null;
  const firstMatch = matches[0] ?? null;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const closePalette = (hideWindow = false) => {
    setOpen(false);
    void window.localVault.closeQuickSearch({ hideWindow });
  };

  const copyEntry = async (entry: VaultEntry | null) => {
    if (isLocked) {
      addToast({ variant: "warning", title: "Vault is locked", message: "Unlock LocalVault before using quick copy." });
      return;
    }
    if (!entry) {
      addToast({ variant: "warning", title: "No password found" });
      return;
    }
    await window.localVault.copyToClipboard({ text: entry.password });
    window.setTimeout(() => {
      void window.localVault.clearClipboard({ text: entry.password });
    }, 30_000);
    addToast({ variant: "success", title: `${entry.siteName} copied`, message: "Clipboard clears in 30 seconds." });
    closePalette(true);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void copyEntry(firstMatch);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      void copyEntry(firstMatch);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => Math.min(current + 1, Math.max(matches.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => Math.max(current - 1, 0));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-zinc-950 p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-glow"
            onKeyDown={onKeyDown}
            onAnimationComplete={focusSearch}
          >
            <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-violet-300" />
              <Input
                ref={setInputRef}
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={isLocked ? "Unlock LocalVault first" : "Search passwords"}
                disabled={isLocked}
                className="h-11 border-0 bg-transparent px-0 text-lg focus:border-0 focus:ring-0"
              />
              <kbd className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-500">Esc</kbd>
            </div>

            {isLocked ? (
              <div className="flex items-center gap-3 px-5 py-4 text-sm text-zinc-400">
                <Lock className="h-4 w-4 text-zinc-500" />
                Unlock the vault before quick copy can search saved passwords.
              </div>
            ) : (
              <div className="max-h-[246px] overflow-y-auto p-2">
                {matches.length > 0 ? (
                  matches.map((entry, index) => {
                    const strength = scorePassword(entry.password);
                    const selectedRow = index === selectedIndex;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => void copyEntry(entry)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                          selectedRow ? "bg-violet-500 text-white" : "text-zinc-300 hover:bg-zinc-900"
                        )}
                      >
                        <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", selectedRow ? "bg-white/15" : "bg-zinc-800")}>
                          <KeyRound className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{entry.siteName}</p>
                          <p className={cn("truncate text-xs", selectedRow ? "text-violet-100" : "text-zinc-500")}>{entry.username || entry.url || entry.category}</p>
                        </div>
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", selectedRow ? "bg-white" : strength.colorClass)} />
                        {selectedRow && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-5 py-4 text-sm text-zinc-500">No matching passwords.</div>
                )}
              </div>
            )}
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
