export type StrengthLabel = "Weak" | "Fair" | "Good" | "Strong";

export interface StrengthResult {
  entropy: number;
  label: StrengthLabel;
  colorClass: string;
  width: number;
}

export const charsetSizeForPassword = (password: string): number => {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^A-Za-z0-9]/.test(password)) size += 33;
  return Math.max(size, 1);
};

export const calculateEntropy = (password: string, explicitCharsetSize?: number): number => {
  if (password.length === 0) return 0;
  const charsetSize = explicitCharsetSize ?? charsetSizeForPassword(password);
  return Math.log2(charsetSize ** password.length);
};

export const strengthForEntropy = (entropy: number): StrengthResult => {
  if (entropy < 28) {
    return { entropy, label: "Weak", colorClass: "bg-red-500", width: Math.max(8, (entropy / 60) * 100) };
  }
  if (entropy < 36) {
    return { entropy, label: "Fair", colorClass: "bg-amber-400", width: Math.max(36, (entropy / 60) * 100) };
  }
  if (entropy < 60) {
    return { entropy, label: "Good", colorClass: "bg-yellow-300", width: Math.min(88, (entropy / 60) * 100) };
  }
  return { entropy, label: "Strong", colorClass: "bg-emerald-400", width: 100 };
};

export const scorePassword = (password: string, explicitCharsetSize?: number): StrengthResult =>
  strengthForEntropy(calculateEntropy(password, explicitCharsetSize));
