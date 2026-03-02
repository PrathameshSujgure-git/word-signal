import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme.js';

export type Screen = 'title' | 'game' | 'result' | 'gameover';

export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  return (
    <Box flexDirection="column">
      <Text color={colors.primary}>SIGNAL — Loading...</Text>
    </Box>
  );
}
