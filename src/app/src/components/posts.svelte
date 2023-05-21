<script lang="ts">
	import type { NavItem } from '../models/nav-item';
	import Posts from './posts.svelte';
	export let nav: NavItem[] = [];
</script>

<ul>
	{#each nav as page}
		<li>
			<a href={'/blog' + page.url}>{page.title}</a>

			{#if page.children.length > 0}
				<Posts nav={page.children} />
			{/if}
		</li>
	{/each}
</ul>
