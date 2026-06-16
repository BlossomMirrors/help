<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';

	let { children }: { children: import('svelte').Snippet } = $props();

	let containerEl = $state<HTMLDivElement | null>(null);
	let sentinelEl = $state<HTMLDivElement | null>(null);
	let showFab = $state(false);

	export function scrollToBottom(smooth = true) {
		sentinelEl?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
	}

	onMount(() => {
		if (!sentinelEl || !containerEl) return;
		const obs = new IntersectionObserver(([entry]) => (showFab = !entry.isIntersecting), {
			root: containerEl,
			threshold: 0.1
		});
		obs.observe(sentinelEl);
		return () => obs.disconnect();
	});
</script>

<div bind:this={containerEl} class="relative flex-1 overflow-y-auto">
	<div class="space-y-4 px-4 py-4">
		{@render children()}
	</div>
	<div bind:this={sentinelEl} class="h-px"></div>

	{#if showFab}
		<button
			onclick={() => scrollToBottom()}
			class="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-popover px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-md transition-colors hover:bg-muted"
		>
			<ArrowDownIcon size={12} />Scroll to bottom
		</button>
	{/if}
</div>
