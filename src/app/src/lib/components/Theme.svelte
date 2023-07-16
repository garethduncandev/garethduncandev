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

	function random() {
		theme.set('random');
		document.body.setAttribute('data-theme', 'random');

		// perform random colour selection here
	}

	function custom() {
		theme.set('custom');
		document.body.setAttribute('data-theme', 'custom');
		// perform color selection here
	}
</script>

<div class="theme-selector">
	<span class="group">
		<button on:click={light}>☀️</button>
		<button on:click={dark}>🌙</button>
	</span>

	<button on:click={custom}>🎨</button>
	<button on:click={random}>🎲</button>
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
