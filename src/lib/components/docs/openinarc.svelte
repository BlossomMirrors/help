<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { ShoppingBag } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let { id } = $props();

	let name = $state<string | undefined>(undefined);

	onMount(() => {
		fetch(`https://arpi.blossomos.org/api/v1/apps/${id}`)
			.then((res) => res.json())
			.then((data) => {
				name = data.name;
			});
	});
</script>

<div class="my-4">
	<Button
		onclick={() => window.open(`appstream://${id}`)}
		aria-label={name ? m.open_in_arc_aria({ name }) : m.open_in_arc()}
	>
		{#if name}
			<img src={`https://arpi.blossomos.org/api/v1/apps/${id}/icon`} alt={name} class="h-4" />
			{m.open_in_arc_aria({ name })}
		{:else}
			<ShoppingBag />
			{m.open_in_arc()}
		{/if}
	</Button>
</div>
