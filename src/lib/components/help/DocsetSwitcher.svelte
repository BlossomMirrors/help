<script lang="ts">
	import type { DocsetMeta } from '$lib/docsets';
	import { getDocsetIds, getDocsetMeta } from '$lib/docsets';
	import { icons } from '$lib/icons';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	type Props = {
		currentDocsetId: string;
		currentDocset: DocsetMeta;
	};

	let { currentDocsetId, currentDocset }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="flex w-full items-center gap-2.5 rounded-[var(--radius-menu)] border border-border bg-muted/40 px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-muted"
	>
		{#if currentDocset.icon && icons[currentDocset.icon]}
			{@const DocIcon = icons[currentDocset.icon]}
			<DocIcon size={14} class="shrink-0 text-primary" />
		{/if}
		<span class="flex-1 text-left font-medium">{currentDocset.title}</span>
		<ChevronDownIcon size={13} class="shrink-0 text-muted-foreground" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#each getDocsetIds() as dsId (dsId)}
			{@const ds = getDocsetMeta(dsId)}
			<DropdownMenu.Item>
				{#snippet child({ props })}
					<a
						href="/help/{dsId}"
						{...props}
						class="{props.class} flex items-center gap-2.5 {dsId === currentDocsetId
							? 'font-medium text-primary'
							: ''}"
					>
						{#if ds.icon && icons[ds.icon]}
							{@const DsIcon = icons[ds.icon]}
							<DsIcon
								size={14}
								class="shrink-0 {dsId === currentDocsetId
									? 'text-primary'
									: 'text-muted-foreground'}"
							/>
						{/if}
						<span>{ds.title}</span>
					</a>
				{/snippet}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
