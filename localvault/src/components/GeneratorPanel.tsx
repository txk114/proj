import { Copy, KeyRound, RefreshCw, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { defaultGeneratorOptions, generatePassphrase, generatePassword, generatorEntropy, type GeneratorOptions } from "../lib/password-gen";
import { strengthForEntropy } from "../lib/strength";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { StrengthBar } from "./StrengthBar";

interface GeneratorPanelProps {
  onUse?: (password: string) => void;
}

export const GeneratorPanel = ({ onUse }: GeneratorPanelProps) => {
  const [options, setOptions] = useState<GeneratorOptions>(defaultGeneratorOptions);
  const [passphraseMode, setPassphraseMode] = useState(false);
  const [wordCount, setWordCount] = useState(4);
  const [words, setWords] = useState<string[]>([]);
  const [password, setPassword] = useState("");

  useEffect(() => {
    void fetch("./eff_large_wordlist.txt")
      .then((response) => response.text())
      .then((text) =>
        setWords(
          text
            .split(/\r?\n/)
            .map((line) => line.trim().split(/\s+/).at(-1) ?? "")
            .filter(Boolean)
        )
      )
      .catch(() => setWords([]));
  }, []);

  const regenerate = () => {
    setPassword(passphraseMode ? generatePassphrase(words, wordCount) : generatePassword(options));
  };

  useEffect(() => {
    regenerate();
  }, [passphraseMode, wordCount, options.length, options.uppercase, options.lowercase, options.numbers, options.symbols, words.length]);

  const entropy = passphraseMode ? Math.log2(Math.max(words.length, 1) ** wordCount) : generatorEntropy(options);
  const strength = strengthForEntropy(entropy);

  const copy = async () => {
    await window.localVault.copyToClipboard({ text: password });
    window.setTimeout(() => {
      void window.localVault.clearClipboard({ text: password });
    }, 30_000);
  };

  const updateOption = <K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/15 text-violet-200">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-zinc-50">Generator</h2>
            <p className="text-sm text-zinc-400">{strength.label} · {entropy.toFixed(0)} bits</p>
          </div>
        </div>

        <motion.div layout className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <Input value={password} readOnly className="h-12 font-mono text-base" />
          <div className="mt-4">
            <StrengthBar password={password} entropy={entropy} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={regenerate}>
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
            <Button variant="secondary" onClick={copy}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            {onUse && (
              <Button variant="secondary" onClick={() => onUse(password)}>
                <KeyRound className="h-4 w-4" />
                Use Password
              </Button>
            )}
          </div>
        </motion.div>
      </section>

      <aside className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-50">Passphrase</span>
          <button
            type="button"
            onClick={() => setPassphraseMode((current) => !current)}
            className={`h-6 w-11 rounded-full p-1 transition ${passphraseMode ? "bg-violet-500" : "bg-zinc-700"}`}
            aria-label="Toggle passphrase mode"
          >
            <span className={`block h-4 w-4 rounded-full bg-white transition ${passphraseMode ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {passphraseMode ? (
            <label className="block space-y-3 text-sm text-zinc-300">
              Words
              <input
                type="range"
                min={4}
                max={6}
                value={wordCount}
                onChange={(event) => setWordCount(Number(event.target.value))}
                className="w-full accent-violet-500"
              />
              <span className="text-xs text-zinc-500">{wordCount} words</span>
            </label>
          ) : (
            <>
              <label className="block space-y-3 text-sm text-zinc-300">
                Length
                <input
                  type="range"
                  min={8}
                  max={128}
                  value={options.length}
                  onChange={(event) => updateOption("length", Number(event.target.value))}
                  className="w-full accent-violet-500"
                />
                <span className="text-xs text-zinc-500">{options.length} characters</span>
              </label>
              {(["uppercase", "lowercase", "numbers", "symbols"] as const).map((key) => (
                <label key={key} className="flex items-center justify-between text-sm text-zinc-300">
                  <span className="capitalize">{key}</span>
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={(event) => updateOption(key, event.target.checked)}
                    className="h-4 w-4 accent-violet-500"
                  />
                </label>
              ))}
            </>
          )}
        </div>
      </aside>
    </div>
  );
};
