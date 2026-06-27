import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { readdirSync } = await import('node:fs');
      const { join } = await import('node:path');
      const dir = join(process.cwd(), 'projects/app/public/content/blog');
      return readdirSync(dir)
        .filter((f: string) => f.endsWith('.md'))
        .map((f: string) => ({ slug: f.replace('.md', '') }));
    },
  },
  {
    path: 'notes/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { readdirSync } = await import('node:fs');
      const { join } = await import('node:path');
      const dir = join(process.cwd(), 'projects/app/public/content/notes');
      return readdirSync(dir)
        .filter((f: string) => f.endsWith('.md'))
        .map((f: string) => ({ slug: f.replace('.md', '') }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
