<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<ol class="my-6 ml-4 list-none space-y-6 [counter-reset:step]">
	{@render children?.()}
</ol>
