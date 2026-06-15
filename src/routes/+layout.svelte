<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import SearchDialog from '$lib/components/search-dialog.svelte';
	import ChatDialog from '$lib/components/chat-dialog.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />
<SearchDialog />
<ChatDialog />
{@render children()}
