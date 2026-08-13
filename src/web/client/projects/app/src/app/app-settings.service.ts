import { computed, Injectable, signal } from '@angular/core';
import { AppSettings } from './app-settings';

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  private readonly settings = signal<AppSettings | undefined>(undefined);
  public readonly apiUrl = computed(() => this.settings()?.apiUrl ?? '');

  public setAppSettings(settings: AppSettings): void {
    this.settings.set(settings);
  }
}
