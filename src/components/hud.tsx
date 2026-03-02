import React from 'react';
import { Text, Box } from 'ink';
import { colors, borders } from '../theme.js';

const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical, teeLeft, teeRight } = borders.double;

interface HUDProps {
  children: React.ReactNode;
  width?: number;
}

export function HUD({ children, width = 50 }: HUDProps) {
  const inner = width - 2;
  const topBorder = topLeft + horizontal.repeat(inner) + topRight;
  const bottomBorder = bottomLeft + horizontal.repeat(inner) + bottomRight;

  return (
    <Box flexDirection="column">
      <Text color={colors.primary}>{topBorder}</Text>
      {children}
      <Text color={colors.primary}>{bottomBorder}</Text>
    </Box>
  );
}

interface HUDRowProps {
  children: React.ReactNode;
  width?: number;
}

export function HUDRow({ children, width = 50 }: HUDRowProps) {
  return (
    <Box>
      <Text color={colors.primary}>{vertical} </Text>
      <Box width={width - 4}>{children}</Box>
      <Text color={colors.primary}> {vertical}</Text>
    </Box>
  );
}

interface HUDDividerProps {
  width?: number;
}

export function HUDDivider({ width = 50 }: HUDDividerProps) {
  const inner = width - 2;
  return <Text color={colors.primary}>{teeLeft + horizontal.repeat(inner) + teeRight}</Text>;
}
