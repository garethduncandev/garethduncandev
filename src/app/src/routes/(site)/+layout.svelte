<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import '../../styles/global.scss';

	const title = 'Gareth Duncan | Developer';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<Header />

<main>
	<slot />
</main>

<footer>
	<Footer />
</footer>

<style lang="scss">
	footer {
		position: fixed;
		bottom: 0;
	}
</style>
