import React from 'react';
import { Text, Box } from 'ink';
import { colors, symbols, borders } from '../theme.js';

export interface ToolState {
  name: string;
  key: string;
  maxUses: number;
  usesLeft: number;
}

interface ToolsPanelProps {
  tools: ToolState[];
}

export function ToolsPanel({ tools }: ToolsPanelProps) {
  return (
    <Box flexDirection="row" gap={1}>
      {tools.map((tool) => {
        const exhausted = tool.usesLeft <= 0;
        const dots = Array.from({ length: tool.maxUses }, (_, i) =>
          i < tool.usesLeft ? symbols.filledCircle : symbols.emptyCircle
        ).join('');

        return (
          <Text key={tool.key}>
            <Text color={exhausted ? colors.border : colors.borderHi}>[</Text>
            <Text color={exhausted ? colors.border : colors.cyan} bold={!exhausted}>{tool.key}</Text>
            <Text color={exhausted ? colors.border : colors.borderHi}>]</Text>
            <Text color={exhausted ? colors.border : colors.text}>{tool.name.toLowerCase()}</Text>
            <Text color={exhausted ? colors.border : colors.green}>{dots}</Text>
          </Text>
        );
      })}
      {/* Help tool — no dots */}
      <Text>
        <Text color={colors.borderHi}>[</Text>
        <Text color={colors.cyan} bold>6</Text>
        <Text color={colors.borderHi}>]</Text>
        <Text color={colors.text}>guide</Text>
      </Text>
    </Box>
  );
}

// ── Help Modal ──────────────────────────────────────────────────────────

interface ToolHelpModalProps {
  tools: ToolState[];
  gameSkipUses: number;
  gameFirstUses: number;
}

const { double } = borders;

const TOOL_INFO: { key: string; name: string; desc: string; perRound: string }[] = [
  { key: '1', name: 'REVEAL', desc: 'Show all letters of a random word', perRound: '1' },
  { key: '2', name: 'HINT',   desc: 'Show 1 letter in current word',     perRound: '5' },
  { key: '3', name: 'FIRST',  desc: '1st letter of all unsolved words', perRound: '—' },
  { key: '4', name: 'SKIP',   desc: 'Skip entire phrase (no life lost)',perRound: '—' },
];

export function ToolHelpModal({ tools, gameSkipUses, gameFirstUses }: ToolHelpModalProps) {
  const w = 64;
  const inner = w - 2;
  const hz = double.horizontal;
  const vt = double.vertical;

  const title = ' TOOLS GUIDE ';
  const titlePadL = Math.floor((inner - title.length) / 2);
  const titlePadR = inner - title.length - titlePadL;

  // Build table rows
  const descW = 36;
  const header = `  KEY  NAME    ${'DESCRIPTION'.padEnd(descW)}LEFT`;
  const sep    = `  ${'─'.repeat(3)}  ${'─'.repeat(6)}  ${'─'.repeat(descW)}${'─'.repeat(4)}`;

  function toolRow(key: string, name: string, desc: string, left: string): string {
    const k = ` [${key}]`.padEnd(5);
    const n = name.padEnd(8);
    const d = desc.length > descW ? desc.slice(0, descW) : desc.padEnd(descW);
    const l = left.padStart(4);
    return `${k}${n}${d}${l}`;
  }

  // Find current remaining for game-wide tools
  const skipTool = tools.find(t => t.key === '4');
  const firstTool = tools.find(t => t.key === '3');
  const skipLeft = skipTool ? `${skipTool.usesLeft}/${gameSkipUses}` : `${gameSkipUses}`;
  const firstLeft = firstTool ? `${firstTool.usesLeft}/${gameFirstUses}` : `${gameFirstUses}`;

  const rows = TOOL_INFO.map(info => {
    if (info.key === '3') return toolRow(info.key, info.name, info.desc, firstLeft);
    if (info.key === '4') return toolRow(info.key, info.name, info.desc, skipLeft);
    const t = tools.find(t => t.key === info.key);
    const left = t ? `${t.usesLeft}/${t.maxUses}` : info.perRound;
    return toolRow(info.key, info.name, info.desc, left);
  });

  const footer = 'press any key to close';
  const footerPad = Math.floor((inner - footer.length) / 2);

  function padLine(s: string): string {
    const vis = s.length;
    return vis >= inner ? s.slice(0, inner) : s + ' '.repeat(inner - vis);
  }

  return (
    <Box flexDirection="column" alignItems="center">
      {/* Top border with title */}
      <Text color={colors.amber}>
        {double.topLeft}{hz.repeat(titlePadL)}
        <Text bold>{title}</Text>
        {hz.repeat(titlePadR)}{double.topRight}
      </Text>

      {/* Empty line */}
      <Text color={colors.amber}>
        {vt}<Text color={colors.text}>{' '.repeat(inner)}</Text>{vt}
      </Text>

      {/* Header */}
      <Text color={colors.amber}>
        {vt}<Text color={colors.textDim}>{padLine(header)}</Text>{vt}
      </Text>

      {/* Separator */}
      <Text color={colors.amber}>
        {vt}<Text color={colors.border}>{padLine(sep)}</Text>{vt}
      </Text>

      {/* Tool rows */}
      {rows.map((row, i) => (
        <Text key={i} color={colors.amber}>
          {vt}<Text color={colors.text}>{padLine(row)}</Text>{vt}
        </Text>
      ))}

      {/* Blank + notes */}
      <Text color={colors.amber}>
        {vt}<Text color={colors.text}>{' '.repeat(inner)}</Text>{vt}
      </Text>
      <Text color={colors.amber}>
        {vt}<Text color={colors.textDim}>{padLine('  FIRST and SKIP are shared across all rounds')}</Text>{vt}
      </Text>
      <Text color={colors.amber}>
        {vt}<Text color={colors.text}>{' '.repeat(inner)}</Text>{vt}
      </Text>
      <Text color={colors.amber}>
        {vt}<Text color={colors.textDim}>{padLine('  CONTROLS')}</Text>{vt}
      </Text>
      <Text color={colors.amber}>
        {vt}<Text color={colors.text}>{padLine('  SPACE  submit word    TAB    jump to next word')}</Text>{vt}
      </Text>
      <Text color={colors.amber}>
        {vt}<Text color={colors.text}>{padLine('  BKSP   delete letter  S-TAB  jump to prev word')}</Text>{vt}
      </Text>

      {/* Blank + footer */}
      <Text color={colors.amber}>
        {vt}<Text color={colors.text}>{' '.repeat(inner)}</Text>{vt}
      </Text>
      <Text color={colors.amber}>
        {vt}<Text color={colors.textDim}>{' '.repeat(footerPad)}{footer}{' '.repeat(inner - footerPad - footer.length)}</Text>{vt}
      </Text>

      {/* Bottom border */}
      <Text color={colors.amber}>
        {double.bottomLeft}{hz.repeat(inner)}{double.bottomRight}
      </Text>
    </Box>
  );
}
