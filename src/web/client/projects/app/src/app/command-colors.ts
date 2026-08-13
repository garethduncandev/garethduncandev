export interface CommandColor {
  text: string;
  textDim: string;
  pillBg: string;
  pillText: string;
  border: string;
  proseLink: string;
  bgSolid: string;
  titleText: string;
}

export const COMMAND_COLORS: Record<string, CommandColor> = {
  contact: {
    text: 'text-violet-400',
    textDim: 'text-violet-700',
    pillBg: 'bg-violet-500',
    pillText: 'text-white',
    border: 'border-violet-400',
    proseLink: 'prose-a:decoration-2 prose-a:decoration-violet-400',
    bgSolid: 'bg-violet-500',

    titleText: 'text-white',
  },
  blog: {
    text: 'text-amber-400',
    textDim: 'text-yellow-600/70',
    pillBg: 'bg-amber-400',
    pillText: 'text-black',
    border: 'border-amber-400',
    proseLink: 'prose-a:decoration-2 prose-a:decoration-amber-400',
    bgSolid: 'bg-amber-400',

    titleText: 'text-black',
  },
  find: {
    text: 'text-emerald-400',
    textDim: 'text-emerald-700',
    pillBg: 'bg-emerald-600',
    pillText: 'text-white',
    border: 'border-emerald-400',
    proseLink: 'prose-a:decoration-2 prose-a:decoration-emerald-400',
    bgSolid: 'bg-emerald-400',

    titleText: 'text-black',
  },
  notes: {
    text: 'text-sky-400',
    textDim: 'text-sky-700',
    pillBg: 'bg-sky-600',
    pillText: 'text-white',
    border: 'border-sky-400',
    proseLink: 'prose-a:decoration-2 prose-a:decoration-sky-400',
    bgSolid: 'bg-sky-400',

    titleText: 'text-black',
  },
  home: {
    text: 'text-teal-400',
    textDim: 'text-teal-700',
    pillBg: 'bg-teal-500',
    pillText: 'text-white',
    border: 'border-teal-400',
    proseLink: 'prose-a:decoration-2 prose-a:decoration-teal-400',
    bgSolid: 'bg-teal-500',

    titleText: 'text-white',
  },
  clear: {
    text: 'text-zinc-400',
    textDim: 'text-zinc-600',
    pillBg: 'bg-zinc-500',
    pillText: 'text-white',
    border: 'border-zinc-400',
    proseLink: 'prose-a:decoration-2 prose-a:decoration-zinc-400',
    bgSolid: 'bg-zinc-500',

    titleText: 'text-white',
  },
};
