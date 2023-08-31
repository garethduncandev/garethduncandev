<script context="module" lang="ts">
	import type { AppSettings } from '../models/appsettings';

	let appSettings: AppSettings | undefined = undefined;

	export async function loadAppSettings() {
		if (appSettings) return appSettings;

		appSettings = (await (
			await fetch('/appsettings.json')
		).json()) as AppSettings;

		return appSettings;
	}
</script>

z
