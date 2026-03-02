import React from 'react';
import { Text, Box } from 'ink';
import { colors } from '../theme.js';

export interface ToolState {
  name: string;
  key: string;
  maxUses: number;
  usesLeft: number;
}

interface ToolsPanelProps {
  tools: ToolState[];
  activeTool: string | null;
}

export function ToolsPanel({ tools, activeTool }: ToolsPanelProps) {
  return (
    <Box flexDirection="column">
      {tools.map((tool) => {
        const isActive = tool.name === activeTool;
        const exhausted = tool.usesLeft <= 0;
        const barFilled = '█'.repeat(tool.usesLeft);
        const barEmpty = '░'.repeat(tool.maxUses - tool.usesLeft);

        const prefix = isActive ? '▸' : ' ';
        const label = `[${tool.key}] ${tool.name.padEnd(12)}`;
        const usage = `${tool.usesLeft}/${tool.maxUses}`;

        if (exhausted) {
          return (
            <Text key={tool.key} color={colors.muted}>
              {prefix} {label} {barFilled}{barEmpty} {usage}
            </Text>
          );
        }

        return (
          <Text key={tool.key}>
            <Text color={isActive ? colors.primary : colors.text}>{prefix} {label} </Text>
            <Text color={colors.success}>{barFilled}</Text>
            <Text color={colors.muted}>{barEmpty}</Text>
            <Text color={colors.text}> {usage}</Text>
          </Text>
        );
      })}
    </Box>
  );
}
