import { Check, Clipboard, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PasswordFieldProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  onCopied?: () => void;
}

export const PasswordField = ({ value, onChange, readOnly = false, placeholder, onCopied }: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const copy = async () => {
    if (!value) return;
    await window.localVault.copyToClipboard({ text: value });
    setCountdown(30);
    onCopied?.();
    window.setTimeout(() => {
      void window.localVault.clearClipboard({ text: value });
    }, 30_000);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          className="pr-10"
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
      <Button type="button" variant="secondary" size="sm" onClick={copy} className="min-w-20">
        {countdown > 0 ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
        {countdown > 0 ? `${countdown}s` : "Copy"}
      </Button>
    </div>
  );
};
