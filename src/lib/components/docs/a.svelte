<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let {
		children,
		href,
		...props
	}: HTMLAnchorAttributes & { children?: Snippet } = $props();

	const isExternal = $derived(/^https?:\/\//.test(href ?? ''));
</script>

{#if isExternal}
	<a {...props} {href} target="_blank" rel="noopener noreferrer">
		{@render children?.()}<ExternalLinkIcon
			size={14}
			class="ml-0.5 inline-block"
		/>
	</a>
{:else}
	<a {...props} {href}>
		{@render children?.()}
	</a>
{/if}
