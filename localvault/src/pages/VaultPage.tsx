import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EntryCard } from "../components/EntryCard";
import { EntryDetail } from "../components/EntryDetail";
import { EntryForm } from "../components/EntryForm";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useVaultStore } from "../store/vault-store";
import type { VaultEntry } from "../types/vault";

export const VaultPage = () => {
  const entries = useVaultStore((state) => state.entries);
  const activeCategory = useVaultStore((state) => state.activeCategory);
  const search = useVaultStore((state) => state.search);
  const selectedEntryId = useVaultStore((state) => state.selectedEntryId);
  const setSearch = useVaultStore((state) => state.setSearch);
  const setSelectedEntry = useVaultStore((state) => state.setSelectedEntry);
  const addEntry = useVaultStore((state) => state.addEntry);
  const updateEntry = useVaultStore((state) => state.updateEntry);
  const deleteEntry = useVaultStore((state) => state.deleteEntry);
  const addToast = useVaultStore((state) => state.addToast);
  const [draftSearch, setDraftSearch] = useState(search);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(draftSearch), 150);
    return () => window.clearTimeout(timer);
  }, [draftSearch, setSearch]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return entries.filter((entry) => {
      const categoryMatch = activeCategory === "All" || entry.category === activeCategory;
      const textMatch =
        query.length === 0 ||
        entry.siteName.toLowerCase().includes(query) ||
        entry.username.toLowerCase().includes(query) ||
        entry.url.toLowerCase().includes(query);
      return categoryMatch && textMatch;
    });
  }, [entries, activeCategory, search]);

  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? null;

  const copyPassword = async (entry: VaultEntry) => {
    await window.localVault.copyToClipboard({ text: entry.password });
    window.setTimeout(() => {
      void window.localVault.clearClipboard({ text: entry.password });
    }, 30_000);
    addToast({ variant: "success", title: "Password copied", message: "Clipboard clears in 30 seconds." });
  };

  return (
    <div className="relative h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-zinc-50">Vault</h1>
          <p className="mt-1 text-sm text-zinc-400">{filtered.length} items</p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search site, username, or URL" className="pl-9" />
      </div>

      <motion.div layout className="mt-5 grid gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.16, delay: Math.min(index * 0.025, 0.12) }}
            >
              <EntryCard
                entry={entry}
                selected={entry.id === selectedEntryId}
                onSelect={() => setSelectedEntry(entry.id)}
                onCopy={() => void copyPassword(entry)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-20 text-center">
          <p className="text-sm text-zinc-400">No items found.</p>
        </div>
      )}

      <EntryDetail
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDelete={(id) => {
          deleteEntry(id);
          addToast({ variant: "success", title: "Item deleted" });
        }}
        onSave={(entry) => {
          updateEntry(entry);
          addToast({ variant: "success", title: "Item updated" });
        }}
        onCopied={() => addToast({ variant: "success", title: "Password copied", message: "Clipboard clears in 30 seconds." })}
      />

      <AnimatePresence>
        {adding && (
          <motion.div className="fixed inset-0 z-40 bg-black/60 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.18 }}
              className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-glow"
            >
              <EntryForm
                onCancel={() => setAdding(false)}
                onSave={(entry) => {
                  addEntry(entry);
                  setAdding(false);
                  addToast({ variant: "success", title: "Item added" });
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
