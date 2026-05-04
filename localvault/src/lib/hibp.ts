export interface HibpResult {
  breached: boolean;
  count: number;
}

const sha1Hex = async (value: string): Promise<string> => {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-1", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
};

export const checkPwnedPassword = async (password: string): Promise<HibpResult | null> => {
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return null;
    const text = await response.text();
    const match = text
      .split("\n")
      .map((line) => line.trim().split(":"))
      .find(([rangeSuffix]) => rangeSuffix === suffix);

    return {
      breached: match !== undefined,
      count: match?.[1] ? Number.parseInt(match[1], 10) : 0
    };
  } catch {
    return null;
  }
};
