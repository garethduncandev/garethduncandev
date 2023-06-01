<script lang="ts">
	import type { PageResponse } from './proxy+page';

	export let data: PageResponse;
</script>

<svelte:head>
	<title>{data.post.metadata.title} | {data.siteTitle}</title>
</svelte:head>

<article>
	<svelte:component this={data.post.content} />
</article>

<style lang="scss">
	@use '../../../../styles/global.scss';
</style>
