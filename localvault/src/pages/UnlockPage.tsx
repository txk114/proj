import { motion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useVaultStore } from "../store/vault-store";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export const UnlockPage = () => {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [exists, setExists] = useState(true);
  const [loading, setLoading] = useState(false);
  const unlock = useVaultStore((state) => state.unlock);
  const addToast = useVaultStore((state) => state.addToast);

  useEffect(() => {
    void window.localVault.vaultExists().then((result) => setExists(Boolean(result.data)));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!password) return;
    setLoading(true);
    const result = await window.localVault.loadVault({ masterPassword: password });
    setLoading(false);
    if (!result.ok || !result.data) {
      addToast({ variant: "error", title: "Wrong password" });
      return;
    }
    unlock(password, result.data);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 p-6">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-glow"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-violet-500/15 text-violet-200">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-medium text-zinc-50">LocalVault</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">{exists ? "Unlock your local vault" : "Create a new local vault"}</p>
        <div className="relative mt-6">
          <Input
            type={visible ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Master password"
            className="pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute right-2 top-1/2 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-50 -translate-y-1/2"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button className="mt-4 w-full" disabled={loading || !password}>
          {loading ? "Unlocking..." : exists ? "Unlock" : "Create vault"}
        </Button>
        <button type="button" className="mt-4 w-full text-center text-sm text-violet-300 hover:text-violet-200" onClick={() => setExists(false)}>
          Create new vault
        </button>
      </motion.form>
    </main>
  );
};
