<script lang="ts" module>
	export { Kbd, Steps, Step, Callout, pre } from '$lib/components/docs';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
