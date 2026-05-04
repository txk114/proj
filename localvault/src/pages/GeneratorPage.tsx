import { GeneratorPanel } from "../components/GeneratorPanel";

export const GeneratorPage = () => (
  <div>
    <div className="mb-5">
      <h1 className="text-2xl font-medium text-zinc-50">Password Generator</h1>
      <p className="mt-1 text-sm text-zinc-400">Create passwords or passphrases for new vault items.</p>
    </div>
    <GeneratorPanel />
  </div>
);
