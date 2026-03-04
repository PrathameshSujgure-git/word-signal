import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { execFile } from 'child_process';
import { colors, borders, renderBlockText } from '../theme.js';
import { ScreenLayout } from '../components/screen-layout.js';

function openUrl(url: string) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  execFile(cmd, [url]);
}

const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical } = borders.double;

const TITLE_LINES = renderBlockText('SIGNAL');

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
    { label: 'INTERCEPT SIGNAL', action: onPlay },
    { label: 'HIGH SCORES', action: onScores },
    { label: 'EXIT', action: onQuit },
    { label: '@invinciDesigns', action: () => openUrl('https://x.com/invinciDesigns') },
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

  const contentWidth = 56;
  const inner = contentWidth - 2;
  // top(1) + blank(1) + title(3) + blank(1) + subtitle(2) + blank(1) + menu(3) + blank(1) + highscore(1) + blank(1) + controls(1) + bottom(1) + credit(1) = 18
  const contentHeight = 18;

  return (
    <ScreenLayout contentHeight={contentHeight} contentWidth={contentWidth}>
      <Box flexDirection="column">
        {/* Double-border modal — PU style with BORDER_HI */}
        <Text color={colors.borderHi}>{topLeft}{horizontal.repeat(inner)}{topRight}</Text>

        <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>

        {/* Block letter title */}
        {TITLE_LINES.map((line, i) => {
          const pad = Math.max(0, inner - line.length);
          const left = Math.floor(pad / 2);
          const right = pad - left;
          return (
            <Text key={`title-${i}`} color={colors.borderHi}>
              {vertical}{' '.repeat(left)}
              <Text color={colors.white} bold>{line}</Text>
              {' '.repeat(right)}{vertical}
            </Text>
          );
        })}

        <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>

        {/* Subtitle — PU style TEXT_DIM */}
        <Text color={colors.borderHi}>
          {vertical}{'  '}
          <Text color={colors.textDim}>signal decoder v3.0</Text>
          {' '.repeat(Math.max(0, inner - 23))}{vertical}
        </Text>
        <Text color={colors.borderHi}>
          {vertical}{'  '}
          <Text color={colors.textDim}>unscramble words before time runs out</Text>
          {' '.repeat(Math.max(0, inner - 40))}{vertical}
        </Text>

        <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>

        {/* Menu items — PU style: ▸ marker in cyan, selected text in cyan+bold */}
        {menuItems.slice(0, 3).map((item, i) => {
          const isSelected = i === selected;
          const marker = isSelected ? '\u25B8 ' : '  ';
          const rendered = marker + item.label;
          const padR = Math.max(0, inner - 2 - rendered.length);
          return (
            <Text key={item.label} color={colors.borderHi}>
              {vertical}{'  '}
              <Text color={isSelected ? colors.cyan : colors.text} bold={isSelected}>
                {marker}{item.label}
              </Text>
              {' '.repeat(padR)}{vertical}
            </Text>
          );
        })}

        <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>

        {/* High score */}
        {highScore > 0 ? (
          <Text color={colors.borderHi}>
            {vertical}{'  '}
            <Text color={colors.textDim}>high score: </Text>
            <Text color={colors.amber} bold>{highScore.toLocaleString('en-US')}</Text>
            {' '.repeat(Math.max(0, inner - 15 - highScore.toLocaleString('en-US').length))}{vertical}
          </Text>
        ) : (
          <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>
        )}

        <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>

        {/* Controls — PU style TEXT_DIM */}
        <Text color={colors.borderHi}>
          {vertical}{'  '}
          <Text color={colors.textDim}>{'\u2191\u2193'}:select  Enter:confirm  q:exit</Text>
          {' '.repeat(Math.max(0, inner - 32))}{vertical}
        </Text>

        <Text color={colors.borderHi}>{bottomLeft}{horizontal.repeat(inner)}{bottomRight}</Text>

        {/* Credit line — selectable */}
        <Text>
          {'  '}<Text color={colors.textDim}>made with </Text>
          <Text color={colors.green}>claude code</Text>
          <Text color={colors.textDim}> and </Text>
          <Text color={colors.red}>{'\u2665'}</Text>
          <Text color={colors.textDim}> by </Text>
          <Text color={selected === 3 ? colors.cyan : colors.textDim} bold={selected === 3}>
            {selected === 3 ? '\u25B8 ' : ''}{'\x1b]8;;https://x.com/invinciDesigns\x07'}@invinciDesigns{'\x1b]8;;\x07'}
          </Text>
        </Text>
      </Box>
    </ScreenLayout>
  );
}
