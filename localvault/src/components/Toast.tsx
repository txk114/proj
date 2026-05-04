import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useVaultStore, type ToastMessage } from "../store/vault-store";
import { cn } from "../lib/utils";

const iconFor = (variant: ToastMessage["variant"]) => {
  if (variant === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (variant === "error") return <XCircle className="h-4 w-4 text-red-400" />;
  if (variant === "warning") return <AlertTriangle className="h-4 w-4 text-amber-300" />;
  return <Info className="h-4 w-4 text-violet-300" />;
};

const ToastItem = ({ toast }: { toast: ToastMessage }) => {
  const dismissToast = useVaultStore((state) => state.dismissToast);

  useEffect(() => {
    const timer = window.setTimeout(() => dismissToast(toast.id), 3000);
    return () => window.clearTimeout(timer);
  }, [dismissToast, toast.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={cn("flex w-80 gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-glow")}
    >
      {iconFor(toast.variant)}
      <div>
        <p className="text-sm font-medium text-zinc-50">{toast.title}</p>
        {toast.message && <p className="mt-1 text-xs text-zinc-400">{toast.message}</p>}
      </div>
    </motion.div>
  );
};

export const Toasts = () => {
  const toasts = useVaultStore((state) => state.toasts);
  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-3">
      <AnimatePresence>{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} />)}</AnimatePresence>
    </div>
  );
};
