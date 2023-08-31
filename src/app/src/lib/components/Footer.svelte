<script lang="ts">
	import { onMount } from 'svelte';
	import { loadAppSettings } from '../../modules/appsettings.svelte';
	import { loadBuildDetails } from '../../modules/build.svelte';
	import type { BuildDetails } from '../../models/build-details';
	import type { AppSettings } from '../../models/appsettings';

	let year: number;
	let buildDetails: BuildDetails;
	let appSettings: AppSettings;
	onMount(async () => {
		buildDetails = loadBuildDetails();
		appSettings = await loadAppSettings();
		year = new Date().getFullYear();
	});
</script>

{#if buildDetails && appSettings}
	<div class="main">
		<div>© Copyright {year}, Gareth Duncan</div>

		<div>
			.NET {buildDetails.dotnetVersion} | SvelteKit {buildDetails.svelteKitVersion}
			| Build {buildDetails.buildNumber} | Commit
			{buildDetails.commitId}
		</div>
		<div>{appSettings.aspNetCoreEnvironment}</div>
		<div>{appSettings.stackName}</div>
		<div><a href="/diagnostics">diagnostics</a></div>
	</div>
{/if}

<style lang="scss">
	.main {
		font-size: 0.8em;
	}
</style>
