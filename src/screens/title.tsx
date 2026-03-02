import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';

const LOGO = `
 ███████╗██╗ ██████╗ ███╗   ██╗ █████╗ ██╗
 ██╔════╝██║██╔════╝ ████╗  ██║██╔══██╗██║
 ███████╗██║██║  ███╗██╔██╗ ██║███████║██║
 ╚════██║██║██║   ██║██║╚██╗██║██╔══██║██║
 ███████║██║╚██████╔╝██║ ╚████║██║  ██║███████╗
 ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝`;

const SCAN_LINE = '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓';
const SUBTITLE = '░░▒▒▓▓ SIGNAL INTERCEPT SYSTEM v1.0 ▓▓▒▒░░';

interface MenuItem {
  label: string;
  action: () => void;
}

interface TitleScreenProps {
  highScore: number;
  onPlay: () => void;
  onScores: () => void;
  onQuit: () => void;
}

export function TitleScreen({ highScore, onPlay, onScores, onQuit }: TitleScreenProps) {
  const [selected, setSelected] = useState(0);

  const menuItems: MenuItem[] = [
    { label: 'INTERCEPT', action: onPlay },
    { label: 'HIGH SCORES', action: onScores },
    { label: 'QUIT', action: onQuit },
  ];

  useInput((input, key) => {
    if (key.upArrow) {
      setSelected((prev) => (prev - 1 + menuItems.length) % menuItems.length);
    } else if (key.downArrow) {
      setSelected((prev) => (prev + 1) % menuItems.length);
    } else if (key.return) {
      menuItems[selected]!.action();
    } else if (input === 'q') {
      onQuit();
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      {/* Scan line top */}
      <Text color={colors.primary} dimColor>{SCAN_LINE}</Text>

      {/* Logo */}
      {LOGO.split('\n').map((line, i) => (
        <Text key={`logo-${i}`} color={colors.primary} bold>{line}</Text>
      ))}

      {/* Scan line bottom */}
      <Text color={colors.primary} dimColor>{SCAN_LINE}</Text>

      {/* Subtitle */}
      <Box marginY={1}>
        <Text color={colors.accent} bold>{SUBTITLE}</Text>
      </Box>

      {/* Menu */}
      <Box flexDirection="column" marginY={1}>
        {menuItems.map((item, i) => {
          const isSelected = i === selected;
          return (
            <Box key={item.label}>
              <Text color={isSelected ? colors.primary : colors.muted} bold={isSelected}>
                {isSelected ? ' ▸ ' : '   '}
                {item.label}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* High score */}
      {highScore > 0 && (
        <Box marginTop={1}>
          <Text color={colors.warning}>HIGH SCORE: {highScore}</Text>
        </Box>
      )}

      {/* Help */}
      <Box marginTop={1}>
        <Text color={colors.muted}>↑↓ navigate • enter select • q quit</Text>
      </Box>
    </Box>
  );
}
