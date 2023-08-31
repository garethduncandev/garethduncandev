<script lang="ts">
	import { theme } from '../../stores/theme-store';
	import { browser } from '$app/environment';

	function light() {
		theme.set('light');
		document.body.setAttribute('data-theme', 'light');
	}

	function dark() {
		theme.set('dark');
		document.body.setAttribute('data-theme', 'dark');
	}
</script>

<div class="theme-selector">
	<span class="group">
		{#if $theme === 'dark'}
			<button on:click={light}>☀️</button>
		{/if}
		{#if $theme === 'light'}
			<button on:click={dark}>🌙</button>
		{/if}
	</span>
</div>

<style lang="scss">
	.theme-selector {
		.group {
			background-color: var(--subtle);
		}

		button {
			padding: 0;
			border: none;
			background: none;
			cursor: pointer;
			font-size: 2em;
		}
	}
</style>
