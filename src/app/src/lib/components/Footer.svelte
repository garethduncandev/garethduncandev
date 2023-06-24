<script lang="ts">
	export let build: string;
	export let commit: string;
	export let dotnetVersion: string;
	export let svelteKitVersion: string;
	export let environment: string;
	export let environmentChannel: string;

	const year = new Date().getFullYear();
	let environmentChannelLabel = '🔵';

	switch (environmentChannel) {
		case 'blue':
			environmentChannel = '🔵';
			break;
		case 'green':
			environmentChannel = '🟢';
			break;
		default:
			environmentChannel = environmentChannel;
	}
</script>

<div>© Copyright {year}, Gareth Duncan</div>
<div>
	.NET {dotnetVersion} | SvelteKit {svelteKitVersion} | Build {build} | Commit {commit}
</div>
<div>{environment} {environmentChannelLabel}</div>
<div><a href="/diagnostics">diagnostics</a></div>

<style lang="scss">
	@use '../../styles/global.scss';
	div {
		text-align: center;
	}
</style>
