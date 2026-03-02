function shiftChar(c: string, shift: number): string {
  if (/[a-z]/.test(c))
    return String.fromCharCode(((c.charCodeAt(0) - 97 + shift + 26) % 26) + 97);
  if (/[A-Z]/.test(c))
    return String.fromCharCode(((c.charCodeAt(0) - 65 + shift + 26) % 26) + 65);
  return c;
}

export function caesarEncrypt(text: string, shift: number): string {
  return [...text].map((c) => shiftChar(c, shift)).join("");
}

export function caesarDecrypt(text: string, shift: number): string {
  return [...text].map((c) => shiftChar(c, -shift)).join("");
}

export function generateSubstitutionKey(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  // Fisher-Yates shuffle
  for (let i = alphabet.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  return alphabet.join("");
}

export function substitutionEncrypt(text: string, key: string): string {
  return [...text]
    .map((c) => {
      if (/[a-z]/.test(c)) return key[c.charCodeAt(0) - 97];
      if (/[A-Z]/.test(c)) return key[c.charCodeAt(0) - 65].toUpperCase();
      return c;
    })
    .join("");
}

export function substitutionDecrypt(text: string, key: string): string {
  const reverseKey = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(key.indexOf(String.fromCharCode(i + 97)) + 97)
  );
  return [...text]
    .map((c) => {
      if (/[a-z]/.test(c)) return reverseKey[c.charCodeAt(0) - 97];
      if (/[A-Z]/.test(c)) return reverseKey[c.charCodeAt(0) - 65].toUpperCase();
      return c;
    })
    .join("");
}

export function generateVigenereKey(): string {
  const len = 3 + Math.floor(Math.random() * 4); // 3-6 chars
  return Array.from({ length: len }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join("");
}

export function vigenereEncrypt(text: string, key: string): string {
  let ki = 0;
  return [...text]
    .map((c) => {
      if (/[a-zA-Z]/.test(c)) {
        const shift = key[ki % key.length].charCodeAt(0) - 97;
        ki++;
        return shiftChar(c, shift);
      }
      return c;
    })
    .join("");
}

export function vigenereDecrypt(text: string, key: string): string {
  let ki = 0;
  return [...text]
    .map((c) => {
      if (/[a-zA-Z]/.test(c)) {
        const shift = key[ki % key.length].charCodeAt(0) - 97;
        ki++;
        return shiftChar(c, -shift);
      }
      return c;
    })
    .join("");
}

export type CipherType = "caesar" | "substitution" | "vigenere";

export interface EncryptedMessage {
  original: string;
  encrypted: string;
  cipherType: CipherType;
  key: number | string;
}

export function encryptMessage(
  text: string,
  cipherType: CipherType
): EncryptedMessage {
  switch (cipherType) {
    case "caesar": {
      const shift = 1 + Math.floor(Math.random() * 25);
      return {
        original: text,
        encrypted: caesarEncrypt(text, shift),
        cipherType,
        key: shift,
      };
    }
    case "substitution": {
      const key = generateSubstitutionKey();
      return {
        original: text,
        encrypted: substitutionEncrypt(text, key),
        cipherType,
        key,
      };
    }
    case "vigenere": {
      const key = generateVigenereKey();
      return {
        original: text,
        encrypted: vigenereEncrypt(text, key),
        cipherType,
        key,
      };
    }
  }
}
