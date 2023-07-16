<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { AppSettings } from '../../models/appsettings';
	import type { NavItem } from '../../models/nav-item';
	import '../../styles/global.scss';

	export let data: { nav: NavItem[]; appSettings: AppSettings };
	const appsettings = data.appSettings;
	const build = appsettings.build;
	const commit = appsettings.commit;
	const dotnetVersion = appsettings.dotnetVersion;
	const svelteKitVersion = appsettings.svelteKitVersion;
	const environment = appsettings.environment;
	const environmentChannel = appsettings.environmentChannel;
	const title = appsettings.title;
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<Header />

<main>
	<slot />
</main>

<footer>
	<Footer
		{build}
		{commit}
		{dotnetVersion}
		{svelteKitVersion}
		{environment}
		{environmentChannel}
	/>
</footer>

<style lang="scss">
	footer {
		position: fixed;
		bottom: 0;
	}
</style>
