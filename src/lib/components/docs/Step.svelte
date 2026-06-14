<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<li
	class="relative pl-10 [counter-increment:step] before:absolute before:left-0 before:top-0.5 before:flex before:h-6 before:w-6 before:items-center before:justify-center before:rounded-full before:bg-primary/10 before:text-xs before:font-semibold before:text-primary before:[content:counter(step)]"
>
	{@render children?.()}
</li>
