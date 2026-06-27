import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';

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
    <h1 class="text-2xl text-zinc-200 mb-6">/blog</h1>
    @for (post of posts(); track post.slug) {
      <article class="mb-4">
        <a [routerLink]="['/blog', post.slug]" class="text-zinc-300 hover:text-white">
          {{ post.title }}
        </a>
        <p class="text-sm text-zinc-500">{{ post.date }} — {{ post.description }}</p>
      </article>
    }
  `,
})
export class BlogComponent {
  private readonly postsResource = httpResource<BlogPostMeta[]>(() => '/content/blog/index.json');

  protected readonly posts = computed(() => this.postsResource.value() ?? []);
}
