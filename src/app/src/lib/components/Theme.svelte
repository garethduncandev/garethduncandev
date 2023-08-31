<script lang="ts">
	import { get } from 'svelte/store';
	import { theme } from '../../stores/theme-store';
	import { onMount } from 'svelte';

	const selectedTheme = theme();

	onMount(() => {
		const k = get(selectedTheme);
		document.body.setAttribute('data-theme', k as string);
	});

	function light() {
		selectedTheme.set('light');
		document.body.setAttribute('data-theme', 'light');
		localStorage.setItem('theme', 'light');
	}

	function dark() {
		selectedTheme.set('dark');
		document.body.setAttribute('data-theme', 'dark');
		localStorage.setItem('theme', 'dark');
	}
</script>

<div class="theme-selector">
	<span class="group">
		{#if $selectedTheme === 'dark'}
			<button on:click={light}>☀️</button>
		{/if}
		{#if $selectedTheme === 'light'}
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
