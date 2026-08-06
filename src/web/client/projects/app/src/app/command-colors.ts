export interface CommandColor {
  text: string;
  pillBg: string;
  pillText: string;
  border: string;
}

export const COMMAND_COLORS: Record<string, CommandColor> = {
  blog:    { text: 'text-violet-400',  pillBg: 'bg-violet-500',  pillText: 'text-white', border: 'border-violet-500/50' },
  contact: { text: 'text-emerald-400', pillBg: 'bg-emerald-600', pillText: 'text-white', border: 'border-emerald-600/50' },
  find:    { text: 'text-sky-400',     pillBg: 'bg-sky-600',     pillText: 'text-white', border: 'border-sky-600/50'     },
  notes:   { text: 'text-amber-400',   pillBg: 'bg-amber-400',   pillText: 'text-black', border: 'border-amber-400/50'   },
  home:    { text: 'text-rose-400',    pillBg: 'bg-rose-500',    pillText: 'text-white', border: 'border-rose-500/50'    },
  clear:   { text: 'text-zinc-400',    pillBg: 'bg-zinc-500',    pillText: 'text-white', border: 'border-zinc-500/50'    },
};
