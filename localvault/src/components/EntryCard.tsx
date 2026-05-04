import { motion } from "framer-motion";
import { Clipboard } from "lucide-react";
import type { VaultEntry } from "../types/vault";
import { scorePassword } from "../lib/strength";
import { cn } from "../lib/utils";

interface EntryCardProps {
  entry: VaultEntry;
  selected: boolean;
  onSelect: () => void;
  onCopy: () => void;
}

const avatarColors = ["bg-violet-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-400", "bg-rose-500", "bg-sky-500"];

export const EntryCard = ({ entry, selected, onSelect, onCopy }: EntryCardProps) => {
  const strength = scorePassword(entry.password);
  const color = avatarColors[entry.siteName.charCodeAt(0) % avatarColors.length] ?? "bg-violet-500";

  return (
    <motion.button
      layout
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16 }}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-left transition hover:bg-zinc-800/70",
        selected && "border-violet-500/70 bg-zinc-800"
      )}
    >
      <div className={cn("grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white", color)}>
        {entry.siteName.slice(0, 1).toUpperCase() || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-zinc-50">{entry.siteName}</p>
          <span className={cn("h-2 w-2 rounded-full", strength.colorClass)} />
        </div>
        <p className="truncate text-xs text-zinc-400">{entry.username || entry.url}</p>
      </div>
      <span
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          onCopy();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onCopy();
          }
        }}
        className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 opacity-0 transition hover:bg-zinc-700 hover:text-zinc-50 group-hover:opacity-100"
        aria-label={`Copy ${entry.siteName} password`}
      >
        <Clipboard className="h-4 w-4" />
      </span>
    </motion.button>
  );
};
