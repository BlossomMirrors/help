<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import SearchDialog from '$lib/components/search-dialog.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />
<SearchDialog />
{@render children()}
