import { motion } from "framer-motion";
import { scorePassword, strengthForEntropy } from "../lib/strength";
import { cn } from "../lib/utils";

interface StrengthBarProps {
  password: string;
  entropy?: number;
  compact?: boolean;
}

export const StrengthBar = ({ password, entropy, compact = false }: StrengthBarProps) => {
  const strength = entropy === undefined ? scorePassword(password) : strengthForEntropy(entropy);

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className={cn("h-full rounded-full", strength.colorClass)}
          initial={false}
          animate={{ width: `${strength.width}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
      {!compact && (
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>{strength.label}</span>
          <span>{strength.entropy.toFixed(0)} bits</span>
        </div>
      )}
    </div>
  );
};
