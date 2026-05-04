import { calculateEntropy } from "./strength";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/|~";

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export const defaultGeneratorOptions: GeneratorOptions = {
  length: 18,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true
};

const randomIndex = (max: number): number => {
  const limit = 256 - (256 % max);
  let byte = crypto.getRandomValues(new Uint8Array(1))[0];
  while (byte >= limit) {
    byte = crypto.getRandomValues(new Uint8Array(1))[0];
  }
  return byte % max;
};

export const charsetFromOptions = (options: GeneratorOptions): string => {
  const chars = [
    options.lowercase ? LOWER : "",
    options.uppercase ? UPPER : "",
    options.numbers ? NUMBERS : "",
    options.symbols ? SYMBOLS : ""
  ].join("");
  return chars.length > 0 ? chars : LOWER;
};

export const generatePassword = (options: GeneratorOptions): string => {
  const charset = charsetFromOptions(options);
  return Array.from({ length: options.length }, () => charset[randomIndex(charset.length)]).join("");
};

export const generatorEntropy = (options: GeneratorOptions): number =>
  calculateEntropy("x".repeat(options.length), charsetFromOptions(options).length);

export const generatePassphrase = (words: string[], count: number): string => {
  const source = words.length > 0 ? words : ["local", "vault", "secure", "simple", "private", "key"];
  return Array.from({ length: count }, () => source[randomIndex(source.length)]).join("-");
};
