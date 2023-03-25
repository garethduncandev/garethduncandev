<script lang="ts">
	import type { NavItem } from '../../models/nav-item';
	export let data: { nav: NavItem[] };
</script>

<ul>
	{#each data.nav as item}
		<li>
			<a href={item.url}><h2>{item.title}</h2></a>
		</li>
	{/each}
</ul>

<style lang="scss">
	ul {
		text-align: center;
		list-style: none;
		padding: 0;
		a {
			text-decoration: none;
		}
	}
</style>
