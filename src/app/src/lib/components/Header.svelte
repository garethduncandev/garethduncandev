<script lang="ts">
	export let build: string;
</script>

<header>
	<h1>Gareth Duncan</h1>
	<nav>
		<ul>
			<li><a href="/posts">posts</a></li>
		</ul>
	</nav>
</header>

<style lang="scss">
	@use '../../styles/global.scss';

	header {
		display: flex;
		align-items: center;
	}

	ul {
		list-style: none;
		a {
			text-decoration: none;
		}
	}
</style>
