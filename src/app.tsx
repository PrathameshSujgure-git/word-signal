import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { colors } from './theme.js';
import { TitleScreen } from './screens/title.js';
import { getHighScore } from './utils/storage.js';

export type Screen = 'title' | 'game' | 'scores' | 'result' | 'gameover';

export function App() {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('title');

  if (screen === 'title') {
    return (
      <TitleScreen
        highScore={getHighScore()}
        onPlay={() => setScreen('game')}
        onScores={() => setScreen('scores')}
        onQuit={() => exit()}
      />
    );
  }

  return (
    <Box flexDirection="column">
      <Text color={colors.primary}>SIGNAL — {screen} (coming soon)</Text>
    </Box>
  );
}
