<script lang="ts">
	import Theme from './Theme.svelte';
</script>

<header>
	<h1><a href="/">Gareth Duncan</a></h1>
	<nav>
		<ul>
			<li><a href="/blog">blog 📝</a></li>
		</ul>
	</nav>
	<Theme />
</header>

<style lang="scss">
	header {
		display: flex;
		align-items: center;
		h1 {
			font-size: 1.5em;
			a {
				color: var(--primary-color-darker);
				text-decoration: none;
			}
		}
	}

	ul {
		list-style: none;
		a {
			text-decoration: none;
		}
	}
</style>
