<script lang="ts">
	import { onMount } from 'svelte';
	import { loadAppSettings } from '../../../modules/appsettings.svelte';
	import { DiagnosticsClient, DiagnosticsVm } from '../../../web-api-client';

	let result: DiagnosticsVm;
	let loading = false;
	let coldStart = false;
	let duration = 0;
	let apiUrl = '';

	onMount(async () => {
		const appSettings = await loadAppSettings();
		apiUrl = appSettings.apiUrl;
		await loadDiagnostics();
	});

	async function loadDiagnostics() {
		loading = true;
		const client = new DiagnosticsClient(apiUrl);
		const start = Date.now();
		result = await client.getDiagnostics();
		const end = Date.now();
		duration = (end - start) / 1000;
		coldStart = duration > 0.5;
		loading = false;
	}
</script>

<h1>Diagnostics</h1>

{#if loading}
	<p>loading...</p>
{/if}

{#if result}
	<p>server datetime: {result.diagnostics.apiDateTime}</p>
	<p>api call duration: {duration} seconds</p>
	<p>possible cold start?: {coldStart}</p>
	<p>environment variable: {result.diagnostics.environment}</p>
	<p>environment display name: {result.diagnostics.environmentDisplayName}</p>
	<button on:click={loadDiagnostics}>Refresh</button>
{/if}
