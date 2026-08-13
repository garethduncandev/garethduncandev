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
        <pre
          class="text-xs text-zinc-500 mt-5 mb-8 font-mono"
        ><span [class]="colors.textDim">---</span>
<span [class]="colors.textDim">date:</span> <span class="text-zinc-500">{{ frontmatter()!.date }}</span>
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
export class NoteComponent {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly colors = COMMAND_COLORS['notes'];

  public readonly slug = input.required<string>();

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
