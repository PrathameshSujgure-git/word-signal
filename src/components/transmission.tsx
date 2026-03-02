import React from 'react';
import { Text, Box } from 'ink';
import { colors } from '../theme.js';

interface TransmissionProps {
  encrypted: string;
  substitutions: Map<string, string>;
  revealedWords: Set<number>;
  originalWords: string[];
}

export function Transmission({ encrypted, substitutions, revealedWords, originalWords }: TransmissionProps) {
  const encryptedWords = encrypted.split(/\s+/);

  const displayWords = encryptedWords.map((word, i) => {
    if (revealedWords.has(i) && i < originalWords.length) {
      return originalWords[i]!.toUpperCase();
    }
    let result = '';
    for (const ch of word) {
      const lower = ch.toLowerCase();
      if (substitutions.has(lower)) {
        result += substitutions.get(lower)!.toUpperCase();
      } else {
        result += ch;
      }
    }
    return result;
  });

  const message = displayWords.join(' ');

  return (
    <Box flexDirection="column">
      <Text color={colors.accent}>░░▒▒▓▓ INTERCEPTED TRANSMISSION ▓▓▒▒░░</Text>
      <Text color={colors.bright}>{message}</Text>
    </Box>
  );
}
