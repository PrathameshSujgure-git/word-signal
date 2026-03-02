// src/theme.ts
export const colors = {
  primary: '#00FFFF',    // cyan
  accent: '#FF00FF',     // magenta
  warning: '#FFD700',    // yellow
  danger: '#FF4444',     // red
  success: '#00FF88',    // green
  muted: '#555555',      // dim gray
  bg: '#000000',         // black
  text: '#CCCCCC',       // light gray
  bright: '#FFFFFF',     // white
} as const;

export const borders = {
  double: { topLeft: '\u2554', topRight: '\u2557', bottomLeft: '\u255A', bottomRight: '\u255D', horizontal: '\u2550', vertical: '\u2551', teeLeft: '\u2560', teeRight: '\u2563' },
  single: { topLeft: '\u250C', topRight: '\u2510', bottomLeft: '\u2514', bottomRight: '\u2518', horizontal: '\u2500', vertical: '\u2502' },
} as const;
