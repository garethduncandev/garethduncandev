<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import '../../styles/global.scss';
	import { navigating } from '$app/stores';
	const title = 'Gareth Duncan | Developer';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<Header />

<main>
	<div>{$navigating}</div>
	{#if Boolean($navigating)}
		<div>Loading</div>
	{/if}
	<slot />
</main>

<footer>
	<Footer />
</footer>

<style lang="scss">
	footer {
		// position: sticky;
		// bottom: 0;
	}
</style>
