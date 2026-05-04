import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Pencil, ShieldAlert, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { checkPwnedPassword, type HibpResult } from "../lib/hibp";
import { scorePassword } from "../lib/strength";
import type { VaultEntry } from "../types/vault";
import { EntryForm } from "./EntryForm";
import { PasswordField } from "./PasswordField";
import { StrengthBar } from "./StrengthBar";
import { Button } from "./ui/button";

interface EntryDetailProps {
  entry: VaultEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSave: (entry: VaultEntry) => void;
  onCopied: () => void;
}

export const EntryDetail = ({ entry, onClose, onDelete, onSave, onCopied }: EntryDetailProps) => {
  const [editing, setEditing] = useState(false);
  const [hibp, setHibp] = useState<HibpResult | null>(null);
  const strength = entry ? scorePassword(entry.password) : null;

  useEffect(() => {
    setEditing(false);
    setHibp(null);
  }, [entry?.id]);

  useEffect(() => {
    if (!entry) return;
    let mounted = true;
    void checkPwnedPassword(entry.password).then((result) => {
      if (mounted) setHibp(result);
    });
    return () => {
      mounted = false;
    };
  }, [entry]);

  return (
    <AnimatePresence>
      {entry && (
        <motion.aside
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed bottom-0 right-0 top-0 z-30 w-[420px] border-l border-zinc-800 bg-zinc-950 p-6 shadow-glow"
        >
          {editing ? (
            <EntryForm
              entry={entry}
              onCancel={() => setEditing(false)}
              onSave={(updated) => {
                onSave(updated);
                setEditing(false);
              }}
            />
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium text-zinc-50">{entry.siteName}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{entry.category}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Username</p>
                  <p className="mt-1 text-sm text-zinc-50">{entry.username || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">URL</p>
                  {entry.url ? (
                    <a href={entry.url} className="mt-1 inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200">
                      {entry.url}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-zinc-50">Not set</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500">Password</p>
                  <PasswordField value={entry.password} readOnly onCopied={onCopied} />
                  <StrengthBar password={entry.password} />
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Strength</span>
                    <span className="text-zinc-50">{strength?.label}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Breach check</span>
                    {hibp?.breached ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-xs text-red-200">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {hibp.count.toLocaleString()} hits
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
                        {hibp === null ? "Unchecked" : "No hits"}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Notes</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300">
                    {entry.notes || "No notes"}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex gap-2 pt-6">
                <Button variant="secondary" className="flex-1" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(entry.id)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
