// Red + white primary theme, green for safe accents, PU layout structure
export const colors = {
  // Backgrounds
  bg: '#06060a',           // near-black navy — global background
  bgPanel: '#0a0a10',     // slightly lighter navy — panels/cards
  bgTicker: '#040410',    // deeper navy — ticker bar

  // Borders — dim red tint
  border: '#331118',       // dim red-grey — unfocused
  borderHi: '#552233',    // medium red-grey — focused/modal

  // Text
  text: '#ddcccc',         // warm off-white — body text
  textDim: '#665555',      // muted warm grey — labels, hints
  textHi: '#ffffff',       // pure white — emphasized

  // Accents
  amber: '#ff3344',        // bright red — titles, accents, modal borders (was amber)
  red: '#ff2222',          // neon red — errors, wrong answers
  green: '#00ff41',        // matrix green — correct, solved, safe
  cyan: '#ffffff',         // pure white — selection, emphasis (was cyan)
  magenta: '#bb88ff',      // soft purple

  // Semantic aliases
  primary: '#ff3344',      // bright red
  success: '#00ff41',      // green for safe/correct
  warning: '#ff6644',      // warm orange-red for scores
  danger: '#ff2222',       // red for errors
  info: '#ffffff',         // white for info/tools
  white: '#ffffff',
  muted: '#665555',
  dim: '#331118',
} as const;

export const borders = {
  double: {
    topLeft: '\u2554',     // ╔
    topRight: '\u2557',    // ╗
    bottomLeft: '\u255A',  // ╚
    bottomRight: '\u255D', // ╝
    horizontal: '\u2550',  // ═
    vertical: '\u2551',    // ║
    teeLeft: '\u2560',     // ╠
    teeRight: '\u2563',    // ╣
  },
  single: {
    topLeft: '\u250C',
    topRight: '\u2510',
    bottomLeft: '\u2514',
    bottomRight: '\u2518',
    horizontal: '\u2500',
    vertical: '\u2502',
    teeLeft: '\u251C',
    teeRight: '\u2524',
  },
} as const;

export const symbols = {
  filledCircle: '\u25CF',  // ●
  emptyCircle: '\u25CB',   // ○
  check: '\u2713',         // ✓
  cross: '\u2717',         // ✗
  arrow: '\u25B8',         // ▸
  barFilled: '\u2588',     // █
  barEmpty: '\u2591',      // ░
  dot: '\u00B7',           // ·
  heartFull: '\u2665',     // ♥
  heartEmpty: '\u2661',    // ♡
} as const;

// Block letter font — 3 rows tall, using █▀▄ characters (PU style)
export const BLOCK_FONT: Record<string, string[]> = {
  A: ['█▀█', '█▀█', '▀ ▀'],
  B: ['█▀▄', '█▀▄', '▀▀▀'],
  C: ['█▀▀', '█  ', '▀▀▀'],
  D: ['█▀▄', '█ █', '▀▀▀'],
  E: ['█▀▀', '█▄▄', '▀▀▀'],
  F: ['█▀▀', '█▄▄', '▀  '],
  G: ['█▀▀', '█ █', '▀▀▀'],
  H: ['█ █', '█▀█', '▀ ▀'],
  I: ['▀█▀', ' █ ', ' ▀ '],
  J: ['  █', '  █', '▀▀▀'],
  K: ['█ █', '█▀▄', '▀ ▀'],
  L: ['█  ', '█  ', '▀▀▀'],
  M: ['█▄▀▄█', '█ ▀ █', '▀   ▀'],
  N: ['█▄ █', '█ ▀█', '▀  ▀'],
  O: ['█▀█', '█ █', '▀▀▀'],
  P: ['█▀█', '█▀▀', '▀  '],
  Q: ['█▀█', '█ █', '▀▀▄'],
  R: ['█▀█', '█▀▄', '▀ ▀'],
  S: ['█▀▀', '▀▀█', '▀▀▀'],
  T: ['▀█▀', ' █ ', ' ▀ '],
  U: ['█ █', '█ █', '▀▀▀'],
  V: ['█ █', '█ █', ' ▀ '],
  W: ['█   █', '█ █ █', '▀▀▀▀▀'],
  X: ['█ █', ' ▀ ', '█ █'],
  Y: ['█ █', ' █ ', ' ▀ '],
  Z: ['▀▀█', ' █ ', '█▀▀'],
  ' ': ['   ', '   ', '   '],
  '?': ['▀▀█', ' ▄▀', ' ▀ '],
};

export function renderBlockText(text: string): string[] {
  const rows = ['', '', ''];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!.toUpperCase();
    const glyph = BLOCK_FONT[ch] ?? BLOCK_FONT[' ']!;
    for (let r = 0; r < 3; r++) {
      if (i > 0) rows[r] += ' ';
      rows[r] += glyph[r];
    }
  }
  return rows;
}
