<script lang="ts">
	import type { PageResponse } from './proxy+page';

	export let data: PageResponse;
</script>

<svelte:head>
	<title>{data.post.metadata.title} | {data.siteTitle}</title>
</svelte:head>

<h1>{data.post.metadata.title}</h1>

<article>
	<svelte:component this={data.post.content} />
</article>

<style>
	article {
		background-color: var(--);
	}
</style>
