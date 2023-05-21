<script lang="ts">
	import type { ComponentType, SvelteComponentTyped } from 'svelte';

	export let data: {
		content: ComponentType<SvelteComponentTyped>;
		title: string;
		date: Date;
	};
</script>

<svelte:head>
	<title>Gareth Duncan | {data.title}</title>
</svelte:head>

<article>
	<svelte:component this={data.content} />
</article>

<style lang="scss">
	@use '../../../../styles/global.scss';
</style>
