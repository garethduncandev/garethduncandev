<script lang="ts">
	import Posts from '../../../components/posts.svelte';
	import type { NavItem } from '../../../models/nav-item';
	export let data: { nav: NavItem[] };
</script>

<Posts nav={data.nav} />

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
