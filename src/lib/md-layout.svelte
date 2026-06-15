<script lang="ts" module>
	export { Kbd, Steps, Step, Callout, pre, code, img, ProtonDBSearch } from '$lib/components/docs';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
