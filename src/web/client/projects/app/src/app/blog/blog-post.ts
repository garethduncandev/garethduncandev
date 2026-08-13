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
        <pre class="text-xs text-zinc-500 mt-5 mb-8"><span [class]="colors.textDim">---</span>
<span [class]="colors.textDim">date:</span> <span class="text-zinc-500">{{ frontmatter()!.date }}</span>
@if (frontmatter()!.updated) {
<span [class]="colors.textDim">updated:</span> <span class="text-zinc-500">{{ frontmatter()!.updated }}</span>
}
<span [class]="colors.textDim">description:</span> <span class="text-zinc-500">{{ frontmatter()!.description }}</span>
<span [class]="colors.textDim">---</span></pre>
        <div [class]="'border mt-4 ' + colors.border">
          <h1 class="-mt-4 mr-4 text-right">
            <span
              [class]="
                colors.bgSolid + ' ' + colors.titleText + ' px-2 py-1 font-mono text-lg font-bold'
              "
              >{{ frontmatter()!.title }}</span
            >
          </h1>
          <div class="p-4">
            <div
              [class]="
                'prose prose-invert max-w-none [&>h1:first-of-type]:hidden ' + colors.proseLink
              "
              [innerHTML]="htmlContent()"
            ></div>
          </div>
        </div>
      </article>
    }
  `,
})
export class BlogPostComponent {
  public readonly slug = input.required<string>();

  protected readonly colors = COMMAND_COLORS['blog'];

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
  private readonly markdownResource = httpResource.text(() => `/content/blog/${this.slug()}.md`);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly parsed = computed(() => {
    const raw = this.markdownResource.value();
    if (!raw) return null;
    const { data, content } = parseFrontmatter(raw);
    return { data, html: marked(content) as string };
  });
}
