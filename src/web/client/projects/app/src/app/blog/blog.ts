import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { COMMAND_COLORS } from '../command-colors';

interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
}

@Component({
  selector: 'app-blog',
  imports: [RouterLink],
  template: `
    <h1 class="text-2xl mb-6 font-mono">
      <span [class]="colors.text">/</span><span class="text-zinc-200">blog</span>
    </h1>
    @for (post of posts(); track post.slug) {
      <article class="mb-4">
        <a
          [routerLink]="['/blog', post.slug]"
          [class]="colors.text + ' hover:text-white font-mono'"
        >
          {{ post.title }}
        </a>
        <p class="text-sm text-zinc-500 font-mono">{{ post.date }} — {{ post.description }}</p>
      </article>
    }
  `,
})
export class BlogComponent {
  private readonly postsResource = httpResource<BlogPostMeta[]>(() => '/content/blog/index.json');
  protected readonly posts = computed(() => this.postsResource.value() ?? []);
  protected readonly colors = COMMAND_COLORS['blog'];
}
