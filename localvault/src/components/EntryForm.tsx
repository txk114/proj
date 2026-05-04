import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { RefreshCw, Save, Wand2, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { PasswordField } from "./PasswordField";
import { StrengthBar } from "./StrengthBar";
import { defaultGeneratorOptions, generatePassword, generatorEntropy, type GeneratorOptions } from "../lib/password-gen";
import { CATEGORIES, type VaultCategory, type VaultEntry } from "../types/vault";

interface EntryFormProps {
  entry?: VaultEntry;
  initialPassword?: string;
  onCancel: () => void;
  onSave: (entry: VaultEntry) => void;
}

const nowIso = (): string => new Date().toISOString();

export const EntryForm = ({ entry, initialPassword = "", onCancel, onSave }: EntryFormProps) => {
  const [siteName, setSiteName] = useState(entry?.siteName ?? "");
  const [url, setUrl] = useState(entry?.url ?? "");
  const [username, setUsername] = useState(entry?.username ?? "");
  const [password, setPassword] = useState(entry?.password ?? initialPassword);
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [category, setCategory] = useState<VaultCategory>(entry?.category ?? "Other");
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [generatorOptions, setGeneratorOptions] = useState<GeneratorOptions>(defaultGeneratorOptions);

  const canSave = siteName.trim().length > 0 && password.length > 0;
  const title = useMemo(() => (entry ? "Edit item" : "New item"), [entry]);
  const generatedEntropy = generatorEntropy(generatorOptions);

  const generateIntoField = () => {
    setPassword(generatePassword(generatorOptions));
  };

  const updateGeneratorOption = <K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) => {
    setGeneratorOptions((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    if (!canSave) return;
    const timestamp = nowIso();
    onSave({
      id: entry?.id ?? crypto.randomUUID(),
      siteName: siteName.trim(),
      url: url.trim(),
      username: username.trim(),
      password,
      notes: notes.trim(),
      category,
      createdAt: entry?.createdAt ?? timestamp,
      updatedAt: timestamp
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-50">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Close form">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4">
        <label className="space-y-2 text-xs font-medium text-zinc-400">
          Site name
          <Input value={siteName} onChange={(event) => setSiteName(event.target.value)} placeholder="Linear" autoFocus />
        </label>
        <label className="space-y-2 text-xs font-medium text-zinc-400">
          URL
          <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://linear.app" />
        </label>
        <label className="space-y-2 text-xs font-medium text-zinc-400">
          Username
          <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="name@example.com" />
        </label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Password</span>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setGeneratorOpen((current) => !current)}>
                <Wand2 className="h-4 w-4" />
                Options
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={generateIntoField}>
                <RefreshCw className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>
          <PasswordField value={password} onChange={setPassword} placeholder="Password" />
          <AnimatePresence initial={false}>
            {generatorOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                  <label className="block space-y-2 text-xs font-medium text-zinc-400">
                    Length
                    <input
                      type="range"
                      min={8}
                      max={128}
                      value={generatorOptions.length}
                      onChange={(event) => updateGeneratorOption("length", Number(event.target.value))}
                      className="w-full accent-violet-500"
                    />
                    <span className="flex justify-between text-xs text-zinc-500">
                      <span>{generatorOptions.length} characters</span>
                      <span>{generatedEntropy.toFixed(0)} bits</span>
                    </span>
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(["uppercase", "lowercase", "numbers", "symbols"] as const).map((key) => (
                      <label key={key} className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
                        <span className="capitalize">{key}</span>
                        <input
                          type="checkbox"
                          checked={generatorOptions[key]}
                          onChange={(event) => updateGeneratorOption(key, event.target.checked)}
                          className="h-4 w-4 accent-violet-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <StrengthBar password={password} />
        <label className="space-y-2 text-xs font-medium text-zinc-400">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as VaultCategory)}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs font-medium text-zinc-400">
          Notes
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Recovery notes, security questions, or context." />
        </label>
      </div>
      <Button className="w-full" onClick={save} disabled={!canSave}>
        <Save className="h-4 w-4" />
        Save item
      </Button>
    </div>
  );
};
