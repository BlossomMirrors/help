<script lang="ts" module>
	export {
		a,
		Kbd,
		Steps,
		Step,
		Callout,
		pre,
		code,
		img,
		ProtonDBSearch,
		OpenInArc
	} from '$lib/components/docs';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
