export interface CommandColor {
  text: string;
  pillBg: string;
  pillText: string;
  border: string;
  proseLink: string;
}

export const COMMAND_COLORS: Record<string, CommandColor> = {
  blog:    { text: 'text-violet-400',  pillBg: 'bg-violet-500',  pillText: 'text-white',     border: 'border-violet-500/50',  proseLink: 'prose-a:decoration-2 prose-a:decoration-violet-400' },
  contact: { text: 'text-emerald-400', pillBg: 'bg-emerald-600', pillText: 'text-white',     border: 'border-emerald-600/50', proseLink: 'prose-a:decoration-2 prose-a:decoration-emerald-400' },
  find:    { text: 'text-sky-400',     pillBg: 'bg-sky-600',     pillText: 'text-white',     border: 'border-sky-600/50',     proseLink: 'prose-a:decoration-2 prose-a:decoration-sky-400'     },
  notes:   { text: 'text-amber-400',   pillBg: 'bg-amber-400',   pillText: 'text-black',     border: 'border-amber-400/50',   proseLink: 'prose-a:decoration-2 prose-a:decoration-amber-400'   },
  home:    { text: 'text-zinc-100',    pillBg: 'bg-zinc-100',    pillText: 'text-zinc-900',  border: 'border-zinc-100/50',    proseLink: 'prose-a:decoration-2 prose-a:decoration-zinc-100'    },
  clear:   { text: 'text-zinc-400',    pillBg: 'bg-zinc-500',    pillText: 'text-white',     border: 'border-zinc-500/50',    proseLink: 'prose-a:decoration-2 prose-a:decoration-zinc-400'    },
};
