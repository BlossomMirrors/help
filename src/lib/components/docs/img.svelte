<script lang="ts">
	import { cn } from '$lib/utils';
	import { Dialog } from 'bits-ui';
	import { Dialog as DialogRoot, DialogTrigger } from '../ui/dialog';
	import DialogPortal from '../ui/dialog/dialog-portal.svelte';
	import Button from '../ui/button/button.svelte';
	import { XIcon } from 'lucide-svelte';

	let { src, alt, class: className } = $props();
</script>

<DialogRoot>
	<DialogTrigger>
		<enhanced:img {src} {alt} class={cn('h-auto max-w-full max-h-150 rounded-xl shadow', className)} />
	</DialogTrigger>
	<DialogPortal>
		<Dialog.Overlay />
		<Dialog.Content
			class="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 grid max-w-[calc(100%)] gap-6 rounded-none p-6 shadow-md ring-1 duration-100 sm:max-w-md fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none"
		>
			<enhanced:img {src} {alt} class={cn('h-auto max-w-full max-h-150 rounded-xl shadow', className)} />
			<Dialog.Close data-slot="dialog-close">
				{#snippet child({ props })}
					<Button variant="ghost" class="absolute top-5 right-5" size="icon-sm" {...props}>
						<XIcon />
						<span class="sr-only">Close</span>
					</Button>
				{/snippet}
			</Dialog.Close>
		</Dialog.Content>
	</DialogPortal>
</DialogRoot>
