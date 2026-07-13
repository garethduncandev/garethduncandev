import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function generateIndex(contentDir) {
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.md'));

  const posts = files
    .map((file) => {
      const raw = readFileSync(join(contentDir, file), 'utf-8');
      const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) return null;

      const frontmatter = frontmatterMatch[1];
      const get = (key) => {
        const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
        return match ? match[1].trim() : '';
      };

      return {
        slug: file.replace('.md', ''),
        title: get('title'),
        date: get('date'),
        description: get('description'),
      };
    })
    .filter(Boolean);

  posts.sort((a, b) => b.date.localeCompare(a.date));

  writeFileSync(join(contentDir, 'index.json'), JSON.stringify(posts, null, 2));
  return posts.length;
}

const blogDir = join(process.cwd(), 'projects/app/public/content/blog');
const notesDir = join(process.cwd(), 'projects/app/public/content/notes');

const blogCount = generateIndex(blogDir);
const notesCount = generateIndex(notesDir);

console.log(`Generated blog index with ${blogCount} post(s)`);
console.log(`Generated notes index with ${notesCount} note(s)`);
