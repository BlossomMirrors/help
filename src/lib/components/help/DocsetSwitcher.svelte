<script lang="ts">
	import type { DocsetMeta } from '$lib/docsets';
	import { getDocsetIds, getDocsetMeta } from '$lib/docsets';
	import { icons } from '$lib/icons';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	type Props = {
		currentDocsetId: string;
		currentDocset: DocsetMeta;
	};

	let { currentDocsetId, currentDocset }: Props = $props();

	let open = $state(false);

	$effect(() => {
		if (!open) return;
		const close = () => (open = false);
		const timer = setTimeout(() => document.addEventListener('click', close, { once: true }), 0);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('click', close);
		};
	});
</script>

<div class="relative">
	<button
		onclick={() => (open = !open)}
		class="flex w-full items-center gap-2.5 rounded-[var(--radius-menu)] border border-border bg-muted/40 px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-muted"
	>
		{#if currentDocset.icon && icons[currentDocset.icon]}
			{@const DocIcon = icons[currentDocset.icon]}
			<DocIcon size={14} strokeWidth={1.5} class="shrink-0 text-primary" />
		{/if}
		<span class="flex-1 text-left font-medium">{currentDocset.title}</span>
		<ChevronDownIcon
			size={13}
			strokeWidth={1.5}
			class="shrink-0 text-muted-foreground transition-transform {open ? 'rotate-180' : ''}"
		/>
	</button>

	{#if open}
		<div
			class="absolute top-full left-0 z-50 mt-1 w-full rounded-[var(--radius-card)] border border-border bg-popover p-1 shadow-md"
		>
			{#each getDocsetIds() as dsId (dsId)}
				{@const ds = getDocsetMeta(dsId)}
				<a
					href="/help/{dsId}"
					onclick={() => (open = false)}
					class="flex items-center gap-2.5 rounded-[var(--radius-menu)] px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent {dsId ===
					currentDocsetId
						? 'text-primary font-medium'
						: 'text-popover-foreground'}"
				>
					{#if ds.icon && icons[ds.icon]}
						{@const DsIcon = icons[ds.icon]}
						<DsIcon
							size={14}
							strokeWidth={1.5}
							class="shrink-0 {dsId === currentDocsetId ? 'text-primary' : 'text-muted-foreground'}"
						/>
					{/if}
					<span>{ds.title}</span>
				</a>
			{/each}
		</div>
	{/if}
</div>
