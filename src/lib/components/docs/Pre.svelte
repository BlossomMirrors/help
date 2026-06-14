<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';
	import * as m from '$lib/paraglide/messages';

	let {
		children,
		class: className,
		...props
	}: HTMLAttributes<HTMLPreElement> & { children?: Snippet } = $props();

	let el = $state<HTMLElement | null>(null);
	let copied = $state(false);

	async function copy() {
		const text = el?.querySelector('code')?.textContent ?? '';
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="group relative my-4 overflow-hidden rounded-lg border border-border bg-card">
	<button
		onclick={copy}
		aria-label={m.aria_copy_code()}
		class={cn(
			'absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded border border-border bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-all',
			'hover:border-primary/40 hover:text-foreground group-hover:opacity-100',
			copied && 'border-green-500/40 text-green-500 opacity-100'
		)}
	>
		{#if copied}
			<CheckIcon size={13} strokeWidth={1.5} />
		{:else}
			<CopyIcon size={13} strokeWidth={1.5} />
		{/if}
	</button>

	<pre
		bind:this={el}
		class={cn('overflow-x-auto px-4 py-4 text-sm leading-relaxed', className)}
		{...props}>{@render children?.()}</pre>
</div>
