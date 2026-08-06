import { Component, computed, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from '../marked-config';
import { parseFrontmatter } from './parse-frontmatter';
import { COMMAND_COLORS } from '../command-colors';

@Component({
  selector: 'app-blog-post',
  template: `
    @if (frontmatter()) {
      <article>
        <pre class="text-xs text-zinc-500 mb-6 "><span class="text-zinc-600">---</span>
<span class="text-zinc-400">title:</span> {{ frontmatter()!.title }}
<span class="text-zinc-400">date:</span> {{ frontmatter()!.date }}
@if (frontmatter()!.updated) {
<span class="text-zinc-400">updated:</span> {{ frontmatter()!.updated }}
}
<span class="text-zinc-400">description:</span> {{ frontmatter()!.description }}
<span class="text-zinc-600">---</span></pre>
        <div [class]="'prose prose-invert max-w-none ' + colors.proseLink" [innerHTML]="htmlContent()"></div>
      </article>
    }
  `,
})
export class BlogPostComponent {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly colors = COMMAND_COLORS['blog'];

  readonly slug = input.required<string>();

  private readonly markdownResource = httpResource.text(() => `/content/blog/${this.slug()}.md`);

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
      updated: data['updated'] ?? '',
      description: data['description'] ?? '',
    };
  });

  protected readonly htmlContent = computed(() => {
    const html = this.parsed()?.html;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : '';
  });
}
