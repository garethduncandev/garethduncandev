<script lang="ts">
	import { onMount } from 'svelte';
	import { DiagnosticsClient, DiagnosticsVm } from '../../../web-api-client';

	import type { PageData } from './$types';
	import { PUBLIC_API_URL } from '$env/static/public';

	export let data: PageData;
	console.log(data);

	let diagnostics: DiagnosticsVm;
	let duration = 0;
	let coldStart = false;
	let loading = false;
	let environment = '';
	let environmentDisplayName = '';

	onMount(async () => {
		loadDiagnostics();
	});

	async function loadDiagnostics() {
		loading = true;
		const client = new DiagnosticsClient(PUBLIC_API_URL);
		const start = Date.now();
		const result = await client.getDiagnostics();
		const end = Date.now();
		duration = (end - start) / 1000;
		diagnostics = result;
		coldStart = duration > 0.5;
		loading = false;
		environment = result.diagnostics.environment;
		environmentDisplayName = result.diagnostics.environmentDisplayName;
	}
</script>

<h1>Diagnostics</h1>

{#if loading}
	<p>loading...</p>
{/if}

{#if diagnostics}
	<p>server datetime: {diagnostics.diagnostics.apiDateTime}</p>
	<p>api call duration: {duration} seconds</p>
	<p>possible cold start?: {coldStart}</p>
	<p>environment variable: {environment}</p>
	<p>environment display name: {environmentDisplayName}</p>
	<button on:click={loadDiagnostics}>Refresh</button>
{/if}
