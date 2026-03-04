import React from 'react';
import { Text, Box } from 'ink';
import { colors } from '../theme.js';
import { type WordState } from '../engine/ciphers.js';

export type WordGameState = 'unsolved' | 'solved' | 'wrong' | 'skipped' | 'hinted';

export interface PhraseWord {
  state: WordState;
  gameState: WordGameState;
}

interface PhraseDisplayProps {
  words: PhraseWord[];
  currentWordIndex: number;
  currentInput: string;
  cursorVisible: boolean;
}

function ScrambledWord({ word, isCurrent }: { word: PhraseWord; isCurrent: boolean }) {
  const { state, gameState } = word;

  if (gameState === 'solved' || gameState === 'hinted') {
    return <Text color={colors.green} bold>{state.original.toUpperCase()}</Text>;
  }
  if (gameState === 'wrong') {
    return <Text color={colors.red} dimColor>{state.original.toUpperCase()}</Text>;
  }
  if (gameState === 'skipped') {
    return <Text color={colors.textDim}>{state.original.toUpperCase()}</Text>;
  }

  const baseColor = isCurrent ? colors.text : colors.textDim;
  const chars = [...state.scrambled];

  return (
    <Text bold={isCurrent}>
      {chars.map((ch, i) => (
        <Text key={i} color={baseColor}>{ch.toUpperCase()}</Text>
      ))}
    </Text>
  );
}

/** Check if a position has a hint (revealed or first-letter). */
function hasHint(w: PhraseWord, pos: number): boolean {
  return w.state.revealedPositions.has(pos) || (w.state.firstRevealed && pos === 0);
}

/** Check if a word has any hints at all. */
function wordHasAnyHint(w: PhraseWord): boolean {
  return w.state.revealedPositions.size > 0 || w.state.firstRevealed;
}

export function PhraseDisplay({ words, currentWordIndex, currentInput, cursorVisible }: PhraseDisplayProps) {
  const gap = '  ';

  return (
    <Box flexDirection="column">
      {/* Row 1: Scrambled words */}
      <Box flexWrap="wrap" gap={0}>
        {words.map((w, i) => (
          <Text key={`sw-${i}`}>
            <ScrambledWord word={w} isCurrent={i === currentWordIndex} />
            {i < words.length - 1 && <Text>{gap}</Text>}
          </Text>
        ))}
      </Box>

      {/* Row 2: Input row — typed chars + cursor only */}
      <Box marginTop={0}>
        {words.map((w, i) => {
          const wordLen = w.state.original.length;
          const suffix = i < words.length - 1 ? gap : '';

          // Resolved words — show result
          if (w.gameState !== 'unsolved') {
            let color: string;
            if (w.gameState === 'solved' || w.gameState === 'hinted') {
              color = colors.green;
            } else if (w.gameState === 'wrong') {
              color = colors.red;
            } else {
              color = colors.textDim;
            }
            return (
              <Text key={`in-${i}`}>
                <Text color={color}>{w.state.original.toUpperCase()}</Text>
                <Text>{suffix}</Text>
              </Text>
            );
          }

          // Current unsolved word — typed chars L→R + cursor
          if (i === currentWordIndex) {
            const typed = currentInput.toUpperCase();
            const cursorPos = typed.length;

            return (
              <Text key={`in-${i}`}>
                {Array.from({ length: wordLen }, (_, pos) => {
                  if (pos < typed.length) {
                    return <Text key={pos} color={colors.text} bold>{typed[pos]}</Text>;
                  }
                  if (pos === cursorPos) {
                    return <Text key={pos} color={cursorVisible ? colors.cyan : colors.border} bold={cursorVisible}>{cursorVisible ? '\u2581' : '_'}</Text>;
                  }
                  return <Text key={pos} color={colors.border}>_</Text>;
                })}
                <Text>{suffix}</Text>
              </Text>
            );
          }

          // Future unsolved words — blank
          return (
            <Text key={`in-${i}`}>
              <Text>{' '.repeat(wordLen)}</Text>
              <Text>{suffix}</Text>
            </Text>
          );
        })}
      </Box>

      {/* Row 3: Hint row — always rendered for fixed height, shows revealed letters */}
      <Box marginTop={0}>
        {words.map((w, i) => {
          const wordLen = w.state.original.length;
          const suffix = i < words.length - 1 ? gap : '';

          // No hints for resolved words — blank space
          if (w.gameState !== 'unsolved') {
            return (
              <Text key={`ht-${i}`}>
                <Text>{' '.repeat(wordLen)}</Text>
                <Text>{suffix}</Text>
              </Text>
            );
          }

          // Show revealed letters at their positions, spaces elsewhere
          return (
            <Text key={`ht-${i}`}>
              {Array.from({ length: wordLen }, (_, pos) => {
                if (hasHint(w, pos)) {
                  return <Text key={pos} color={colors.textDim}>{w.state.original[pos]!.toUpperCase()}</Text>;
                }
                return <Text key={pos}>{' '}</Text>;
              })}
              <Text>{suffix}</Text>
            </Text>
          );
        })}
      </Box>
    </Box>
  );
}
