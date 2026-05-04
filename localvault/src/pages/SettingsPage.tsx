import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { checkPwnedPassword } from "../lib/hibp";
import { useVaultStore } from "../store/vault-store";
import { Button } from "../components/ui/button";

export const SettingsPage = () => {
  const entries = useVaultStore((state) => state.entries);
  const settings = useVaultStore((state) => state.settings);
  const updateSettings = useVaultStore((state) => state.updateSettings);
  const addToast = useVaultStore((state) => state.addToast);
  const [scanning, setScanning] = useState(false);

  const scanAll = async () => {
    setScanning(true);
    const results = await Promise.all(entries.map((entry) => checkPwnedPassword(entry.password)));
    setScanning(false);
    const breached = results.filter((result) => result?.breached).length;
    addToast({
      variant: breached > 0 ? "warning" : "success",
      title: breached > 0 ? `${breached} breached passwords found` : "No breached passwords found"
    });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-medium text-zinc-50">Settings</h1>
      <div className="mt-6 space-y-4">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-base font-medium text-zinc-50">Auto-lock</h2>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Lock after inactivity</p>
              <p className="text-xs text-zinc-500">The vault clears from app state and returns to unlock.</p>
            </div>
            <select
              value={settings.autoLockMinutes}
              onChange={(event) => updateSettings({ autoLockMinutes: Number(event.target.value) })}
              className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-violet-500"
            >
              {[1, 5, 10, 15, 30].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-medium text-zinc-50">Breach scan</h2>
              <p className="mt-1 text-sm text-zinc-400">Checks saved passwords against HIBP. Offline failures are ignored.</p>
            </div>
            <Button onClick={scanAll} disabled={scanning || entries.length === 0}>
              <ShieldCheck className="h-4 w-4" />
              {scanning ? "Scanning..." : "Scan All"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};
