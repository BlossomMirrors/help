<script lang="ts">
	import KbdRoot from '$lib/components/ui/kbd/kbd.svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from '$lib/utils.js';

	let { children, ...props }: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<KbdRoot {...props}>{@render children?.()}</KbdRoot>
