import React from 'react';
import { Text, Box } from 'ink';
import { colors, borders } from '../theme.js';

const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical, teeLeft, teeRight } = borders.double;

interface HUDProps {
  children: React.ReactNode;
  width?: number;
  title?: string;
}

export function HUD({ children, width = 60, title }: HUDProps) {
  const inner = width - 2;

  let topBar: React.ReactNode;
  if (title) {
    const titleStr = ` ${title} `;
    const remaining = inner - titleStr.length;
    const left = Math.floor(remaining / 2);
    const right = Math.max(0, remaining - left);
    topBar = (
      <Text color={colors.borderHi}>
        {topLeft}{horizontal.repeat(left)}
        <Text color={colors.amber} bold>{titleStr}</Text>
        {horizontal.repeat(right)}{topRight}
      </Text>
    );
  } else {
    topBar = <Text color={colors.borderHi}>{topLeft}{horizontal.repeat(inner)}{topRight}</Text>;
  }

  return (
    <Box flexDirection="column">
      {topBar}
      {children}
      <Text color={colors.borderHi}>{bottomLeft}{horizontal.repeat(inner)}{bottomRight}</Text>
    </Box>
  );
}

interface HUDRowProps {
  children: React.ReactNode;
  width?: number;
}

export function HUDRow({ children, width = 60 }: HUDRowProps) {
  return (
    <Box>
      <Text color={colors.borderHi}>{vertical} </Text>
      <Box width={width - 4} flexShrink={0}>{children}</Box>
      <Text color={colors.borderHi}> {vertical}</Text>
    </Box>
  );
}

interface HUDDividerProps {
  width?: number;
}

export function HUDDivider({ width = 60 }: HUDDividerProps) {
  const inner = width - 2;
  return <Text color={colors.borderHi}>{teeLeft}{horizontal.repeat(inner)}{teeRight}</Text>;
}
