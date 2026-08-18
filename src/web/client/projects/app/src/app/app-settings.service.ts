import { computed, Injectable, signal } from '@angular/core';
import { AppSettings } from './app-settings';

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  public readonly apiUrl = computed(() => this.settings()?.apiUrl ?? '');
  private readonly settings = signal<AppSettings | undefined>(undefined);

  public setAppSettings(settings: AppSettings): void {
    this.settings.set(settings);
  }
}
