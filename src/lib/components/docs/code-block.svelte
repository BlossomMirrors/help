<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';
	import * as m from '$lib/paraglide/messages';

	let { children }: { children?: Snippet } = $props();

	let el = $state<HTMLElement | null>(null);
	let copied = $state(false);

	async function copy() {
		const text = el?.querySelector('pre')?.textContent ?? '';
		await navigator.clipboard.writeText(text.replace(/\n$/, ''));
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div bind:this={el} class="group/code relative">
	<button
		type="button"
		onclick={copy}
		aria-label={m.aria_copy_code()}
		class={cn(
			'absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded border bg-background opacity-0 transition-[opacity,color,border-color]',
			'group-hover/code:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
			copied
				? 'border-green-500/40 text-green-500 opacity-100'
				: 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
		)}
	>
		{#if copied}
			<CheckIcon size={13} />
		{:else}
			<CopyIcon size={13} />
		{/if}
	</button>
	{@render children?.()}
</div>
