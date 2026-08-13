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
  public readonly searchResults = httpResource<SearchResult[]>(() => {
    const q = this.query();
    const base = this.apiUrl();
    if (!q || !base) return undefined;
    const typeParam = this.type();
    const params = new URLSearchParams({ query: q });
    if (typeParam && typeParam !== 'all') params.set('type', typeParam);
    return `${base}/search?${params.toString()}`;
  });

  public readonly results = computed(() =>
    this.searchResults.hasValue() ? this.searchResults.value() : [],
  );
  public readonly isLoading = computed(() => this.searchResults.isLoading());
  public readonly error = computed(() => this.searchResults.error());

  private readonly appSettings = inject(AppSettingsService);
  private readonly apiUrl = this.appSettings.apiUrl;

  private readonly query = signal<string | undefined>(undefined);
  private readonly type = signal<string | undefined>(undefined);

  public search(query: string, type?: string): void {
    this.type.set(type);
    this.query.set(query);
  }

  public clear(): void {
    this.query.set(undefined);
    this.type.set(undefined);
  }
}
