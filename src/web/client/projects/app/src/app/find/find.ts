import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SearchResult, SearchService } from '../search.service';

@Component({
  selector: 'app-find',
  imports: [RouterLink],
  template: `
    <h1 class="text-2xl text-zinc-200 mb-6 font-mono">/find {{ queryParam() }}</h1>
    @if (searchService.isLoading()) {
      <p class="text-zinc-500 font-mono">searching...</p>
    } @else if (searchService.error()) {
      <p class="text-zinc-500 font-mono">search unavailable</p>
    } @else if (searchService.results().length === 0 && queryParam()) {
      <p class="text-zinc-500 font-mono">no results for "{{ queryParam() }}"</p>
    }
    @for (result of searchService.results(); track $index) {
      <article class="mb-4">
        <a [routerLink]="routeFor(result)" class="text-zinc-300 hover:text-white font-mono">
          {{ result.title ?? result.slug }}
        </a>
        <p class="text-sm text-zinc-500 font-mono">
          @if (result.date) {
            {{ result.date }} —
          }
          {{ result.type }}
          @if (result.description) {
            — {{ result.description }}
          }
        </p>
      </article>
    }
  `,
})
export class Find {
  private readonly route = inject(ActivatedRoute);
  protected readonly searchService = inject(SearchService);

  protected readonly queryParam = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  constructor() {
    effect(() => {
      const q = this.queryParam();
      if (q) {
        this.searchService.search(q);
      } else {
        this.searchService.clear();
      }
    });
  }

  protected routeFor(result: SearchResult): string[] {
    if (result.slug) {
      return [`/${result.type}`, result.slug];
    }
    return ['/'];
  }
}
