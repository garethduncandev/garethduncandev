import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SearchResult, SearchService } from '../search.service';
import { CommandFocusService } from '../command-focus.service';
import { COMMAND_COLORS } from '../command-colors';

@Component({
  selector: 'app-search',
  imports: [RouterLink],
  template: `
    <h1 class="text-2xl mb-6 font-mono">
      <span [class]="colors.text">/</span
      ><span class="text-zinc-200">search {{ queryParam() }}</span>
    </h1>
    @if (searchService.isLoading()) {
      <p class="text-zinc-500 font-mono">searching...</p>
    } @else if (searchService.error()) {
      <p class="text-zinc-500 font-mono">search unavailable</p>
    } @else if (searchService.results().length === 0 && queryParam()) {
      <p class="text-zinc-500 font-mono">no results for "{{ queryParam() }}"</p>
    }
    @for (result of searchService.results(); track $index) {
      <article class="mb-4">
        <a [routerLink]="routeFor(result)" [class]="colors.text + ' hover:text-white font-mono'">
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
export class Search {
  protected readonly searchService = inject(SearchService);
  protected readonly colors = COMMAND_COLORS['search'];
  protected readonly queryParam = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  constructor() {
    inject(CommandFocusService).requestFocus();

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
