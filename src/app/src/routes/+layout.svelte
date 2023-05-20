<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { AppSettings } from '../models/appsettings';
	import type { NavItem } from '../models/nav-item';
	import '../styles/global.scss';

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
	<Header />

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
</style>
