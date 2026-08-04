import { computed, inject, Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { AppSettingsService } from './app-settings.service';

export interface SearchResult {
  slug: string | null;
  title: string | null;
  description: string | null;
  date: string | null;
  type: string;
  similarity: number;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly appSettings = inject(AppSettingsService);
  private readonly apiUrl = this.appSettings.apiUrl;

  private readonly query = signal<string | undefined>(undefined);
  private readonly type = signal<string | undefined>(undefined);

  readonly searchResults = httpResource<SearchResult[]>(() => {
    const q = this.query();
    const base = this.apiUrl();
    if (!q || !base) return undefined;
    const typeParam = this.type();
    const params = new URLSearchParams({ query: q });
    if (typeParam && typeParam !== 'all') params.set('type', typeParam);
    return `${base}/search?${params.toString()}`;
  });

  readonly results = computed(() =>
    this.searchResults.hasValue() ? this.searchResults.value() : [],
  );
  readonly isLoading = computed(() => this.searchResults.isLoading());
  readonly error = computed(() => this.searchResults.error());

  search(query: string, type?: string): void {
    this.type.set(type);
    this.query.set(query);
  }

  clear(): void {
    this.query.set(undefined);
    this.type.set(undefined);
  }
}
