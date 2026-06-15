<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';

	let { placeholder = 'Search a game on ProtonDB...' }: { placeholder?: string } = $props();

	let query = $state('');

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		const trimmed = query.trim();
		if (!trimmed) return;
		window.open(
			`https://www.protondb.com/search?q=${encodeURIComponent(trimmed)}`,
			'_blank',
			'noopener noreferrer'
		);
	}
</script>

<form onsubmit={handleSearch} class="not-prose my-4 flex gap-2">
	<Input type="text" bind:value={query} {placeholder} class="flex-1" />
	<Button type="submit" variant="primary">Search</Button>
</form>
