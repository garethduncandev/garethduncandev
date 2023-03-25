<script lang="ts">
	export let build: string;
	export let commit: string;
	export let dotnetVersion: string;
	export let svelteKitVersion: string;
	export let environment: string;
	export let environmentColor: string;

	const year = new Date().getFullYear();
	let environmentColorEmoji = '🔵';

	switch (environmentColor) {
		case 'blue':
			environmentColor = '🔵';
			break;
		case 'green':
			environmentColor = '🟢';
			break;
		default:
			environmentColor = environmentColor;
	}
</script>

<div>© Copyright {year}, Gareth Duncan</div>
<div>
	.NET {dotnetVersion} | SvelteKit {svelteKitVersion} | Build {build} | Commit {commit}
</div>
<div>{environment} {environmentColorEmoji}</div>

<style lang="scss">
	@use '../../styles/global.scss';
	div {
		text-align: center;
	}
</style>
