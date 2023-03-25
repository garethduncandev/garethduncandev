<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { AppSettings } from '..//models/appsettings';
	import type { NavItem } from '../models/nav-item';

	export let data: { nav: NavItem[]; appSettings: AppSettings };
	const appsettings = data.appSettings;
	const build = appsettings.build;
	const commit = appsettings.commit;
	const dotnetVersion = appsettings.dotnetVersion;
	const svelteKitVersion = appsettings.svelteKitVersion;
	const environment = appsettings.environment;
	const environmentColor = appsettings.environmentColor;
</script>

<svelte:head>
	<title>Gareth Duncan | Developer</title>
</svelte:head>
<div class="container">
	<Header {build} />

	<main>
		<slot />
	</main>

	<Footer
		{build}
		{commit}
		{dotnetVersion}
		{svelteKitVersion}
		{environment}
		{environmentColor}
	/>
</div>

<style lang="scss">
	@use '../styles/global.scss';

	.container {
		background-color: black;
		height: 100vh;
	}
</style>
