<script lang="ts">
	import type { Snippet } from 'svelte';

	type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

	let {
		type = 'note',
		title,
		children
	}: { type?: CalloutType; title?: string; children?: Snippet } = $props();

	const styles: Record<CalloutType, string> = {
		note: 'border-blue-400 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
		tip: 'border-green-400 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200',
		important:
			'border-purple-400 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200',
		warning:
			'border-yellow-400 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200',
		caution: 'border-red-400 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200'
	};
</script>

<aside class="my-4 rounded-r-lg border-l-4 px-4 py-3 {styles[type]}">
	{#if title}<p class="mb-1 text-sm font-semibold tracking-wide uppercase">{title}</p>{/if}
	<div class="text-sm [&>p]:my-0">{@render children?.()}</div>
</aside>
