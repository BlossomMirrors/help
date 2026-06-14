<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		children,
		class: className,
		...props
	}: HTMLAttributes<HTMLElement> & { children?: Snippet } = $props();

	let el = $state<HTMLElement | null>(null);
	const clipboard = new UseClipboard();
</script>

<span class="relative inline-block">
	{#if clipboard.status === 'success'}
		<span
			class="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[11px] text-background"
		>
			Copied!
		</span>
	{/if}
	<code
		bind:this={el}
		onclick={() => clipboard.copy(el?.textContent ?? '')}
		class={cn(
			'cursor-pointer rounded px-[0.3em] py-[0.15em] font-mono text-[0.875em] transition-colors',
			'bg-muted text-foreground hover:bg-primary/15 hover:text-primary',
			clipboard.status === 'success' && 'bg-green-500/15 text-green-600 dark:text-green-400',
			className
		)}
		{...props}>{@render children?.()}</code
	>
</span>
