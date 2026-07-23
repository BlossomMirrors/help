<script lang="ts">
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import { marked } from 'marked';
	import * as m from '$lib/paraglide/messages';

	let {
		role,
		content,
		streaming = false
	}: {
		role: 'user' | 'assistant';
		content: string;
		streaming?: boolean;
	} = $props();

	function renderArcLinks(raw: string): string {
		const label = m.open_in_arc();
		return raw.replace(
			/<a href="(appstream:\/\/[^"]+)"[^>]*>[^<]*<\/a>/g,
			(_, href) => `<a href="${href}" class="arc-btn" aria-label="${label}">${label}</a>`
		);
	}

	const html = $derived(renderArcLinks(marked.parse(content, { async: false }) as string));
</script>

{#if role === 'user'}
	<div class="flex justify-end">
		<div
			class="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
		>
			{content}
		</div>
	</div>
{:else}
	<div class="flex gap-2.5">
		<div
			class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10"
		>
			<SparklesIcon size={12} class="text-primary" />
		</div>
		<div class="prose prose-sm dark:prose-invert max-w-none min-w-0 flex-1">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html html}
			{#if streaming}<span
					class="ml-px inline-block h-[1em] w-0.5 animate-pulse bg-foreground align-middle"
				></span>{/if}
		</div>
	</div>
{/if}

<style>
	:global(.arc-btn) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: var(--radius-button);
		border: 1px solid color-mix(in srgb, var(--color-primary) 50%, transparent);
		background: color-mix(in srgb, var(--color-primary) 15%, transparent);
		padding: 0.25rem 0.625rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-foreground);
		text-decoration: none !important;
		transition:
			border-color 100ms,
			background 100ms;
		vertical-align: middle;
	}
	:global(.arc-btn:hover) {
		border-color: color-mix(in srgb, var(--color-primary) 80%, transparent);
		background: color-mix(in srgb, var(--color-primary) 25%, transparent);
	}
</style>
