import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { AppSettings } from './app-settings';
import { AppSettingsService } from './app-settings.service';

export function appSettingsInitializerFactory() {
  const httpClient = inject(HttpClient);
  const appSettingsService = inject(AppSettingsService);

  return httpClient.get<AppSettings>('app-settings/appsettings.json').pipe(
    tap((settings) => appSettingsService.setAppSettings(settings)),
    map(() => void 0),
  );
}
