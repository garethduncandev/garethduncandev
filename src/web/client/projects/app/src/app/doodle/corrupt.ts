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

function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function makeRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

export function corruptLine(line: string): CorruptedLine {
  const rand = makeRng(hashString(line));
  const chars = [...line];
  const len = chars.length;
  const regionStart = Math.floor(len * 0.66);
  if (regionStart >= len) return { text: line, segments: [...chars] };

  const count = Math.floor(rand() * 5) + 2;
  const positions = new Set<number>();
  while (positions.size < count && positions.size < len - regionStart) {
    positions.add(regionStart + Math.floor(rand() * (len - regionStart)));
  }

  for (const pos of positions) {
    if (chars[pos] === ' ') continue;
    if (rand() > 0.375) continue;
    chars[pos] = CORRUPTION_CHARS[Math.floor(rand() * CORRUPTION_CHARS.length)];
  }

  return { text: chars.join(''), segments: chars };
}
