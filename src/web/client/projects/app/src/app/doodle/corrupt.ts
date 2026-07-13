const CORRUPTION_CHARS = [
  '░',
  '▒',
  '@',
  '┤',
  '~',
  '¦',
  '╫',
  '¬',
  '⌐',
  'Ã',
  '¢',
  '€',
  'Â',
  '¿',
  'Ã©',
  'Ã¼',
  'â€¢',
  '�',
  'ï»¿',
  'Ã¶',
  'â€œ',
  'Ð',
  'Ã¤',
  'Ã±',
  'â€™',
  'â€"',
  '\x00',
];

export interface CorruptedLine {
  text: string;
  segments: string[];
}

export function corruptLine(line: string): CorruptedLine {
  const chars = [...line];
  const len = chars.length;
  const regionStart = Math.floor(len * 0.66);
  if (regionStart >= len) return { text: line, segments: [...chars] };

  const count = Math.floor(Math.random() * 5) + 2;
  const positions = new Set<number>();
  while (positions.size < count && positions.size < len - regionStart) {
    positions.add(regionStart + Math.floor(Math.random() * (len - regionStart)));
  }

  for (const pos of positions) {
    if (chars[pos] === ' ') continue;
    if (Math.random() > 0.375) continue;
    chars[pos] = CORRUPTION_CHARS[Math.floor(Math.random() * CORRUPTION_CHARS.length)];
  }

  return { text: chars.join(''), segments: chars };
}
