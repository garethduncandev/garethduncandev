import { Component, computed, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from '../marked-config';
import { parseFrontmatter } from '../blog/parse-frontmatter';
import { COMMAND_COLORS } from '../command-colors';

@Component({
  selector: 'app-note',
  template: `
    @if (frontmatter()) {
      <article>
        <pre class="text-xs text-zinc-500 mb-6 font-mono"><span class="text-zinc-600">---</span>
<span class="text-zinc-400">title:</span> {{ frontmatter()!.title }}
<span class="text-zinc-400">date:</span> {{ frontmatter()!.date }}
<span class="text-zinc-400">description:</span> {{ frontmatter()!.description }}
<span class="text-zinc-600">---</span></pre>
        <div [class]="'prose prose-invert max-w-none ' + colors.proseLink" [innerHTML]="htmlContent()"></div>
      </article>
    }
  `,
})
export class NoteComponent {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly colors = COMMAND_COLORS['notes'];

  readonly slug = input.required<string>();

  private readonly markdownResource = httpResource.text(() => `/content/notes/${this.slug()}.md`);

  private readonly parsed = computed(() => {
    const raw = this.markdownResource.value();
    if (!raw) return null;
    const { data, content } = parseFrontmatter(raw);
    return { data, html: marked(content) as string };
  });

  protected readonly frontmatter = computed(() => {
    const data = this.parsed()?.data;
    if (!data) return null;
    return {
      title: data['title'] ?? '',
      date: data['date'] ?? '',
      description: data['description'] ?? '',
    };
  });

  protected readonly htmlContent = computed(() => {
    const html = this.parsed()?.html;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : '';
  });
}
