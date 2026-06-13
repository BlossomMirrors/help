<script lang="ts">
	import NavTree from '$lib/components/help/NavTree.svelte';
	import type { NavNode, NavTag } from '$lib/nav';
	import { icons } from '$lib/icons';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import * as m from '$lib/paraglide/messages';

	type Props = {
		nodes: NavNode[];
		depth: number;
		openFolders: Set<string>;
		currentPath: string;
		tagClasses: Record<NavTag, string>;
		onToggle: (slug: string) => void;
		onClose: () => void;
	};

	let { nodes, depth, openFolders, currentPath, tagClasses, onToggle, onClose }: Props = $props();
</script>

<ul
	class={depth === 0 ? 'space-y-0.5' : 'ml-3.5 mt-0.5 space-y-0.5 border-l border-border pl-2'}
>
	{#each nodes as node (node.slug)}
		{@const hasChildren = node.children.length > 0}
		{@const isOpen = openFolders.has(node.slug)}

		{#if node.href && hasChildren}
			{@const active = currentPath === node.href}
			<li>
				<div
					class={[
						'flex items-center rounded-[var(--radius-sidebar-item)] text-sm transition-colors',
						active
							? 'bg-primary/10 text-primary'
							: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
					].join(' ')}
				>
					<a
						href={node.href}
						onclick={onClose}
						class="flex flex-1 items-center gap-2 px-2 py-1.5 {active ? 'font-medium' : ''}"
					>
						{#if node.icon && icons[node.icon]}
							{@const Icon = icons[node.icon]}
							<Icon
								size={14}
								strokeWidth={1.5}
								class="shrink-0 {active ? 'text-primary' : 'opacity-60'}"
							/>
						{/if}
						<span class="flex-1 truncate">{node.title}</span>
						{#if node.tag}
							<span
								class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide {tagClasses[node.tag]}"
								>{node.tag === 'new'
									? m.tag_new()
									: node.tag === 'beta'
										? m.tag_beta()
										: m.tag_deprecated()}</span
							>
						{/if}
					</a>
					<button
						onclick={() => onToggle(node.slug)}
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
						aria-label={isOpen ? m.aria_collapse() : m.aria_expand()}
					>
						<ChevronRightIcon
							size={13}
							strokeWidth={1.5}
							class="transition-transform {isOpen ? 'rotate-90' : ''}"
						/>
					</button>
				</div>
				{#if isOpen}
					<NavTree
						nodes={node.children}
						depth={depth + 1}
						{openFolders}
						{currentPath}
						{tagClasses}
						{onToggle}
						{onClose}
					/>
				{/if}
			</li>

		{:else if node.href}
			{@const active = currentPath === node.href}
			<li>
				<a
					href={node.href}
					onclick={onClose}
					class={[
						'flex items-center gap-2 rounded-[var(--radius-sidebar-item)] px-2 py-1.5 text-sm transition-colors',
						active
							? 'bg-primary/10 font-medium text-primary'
							: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
					].join(' ')}
				>
					{#if node.icon && icons[node.icon]}
						{@const Icon = icons[node.icon]}
						<Icon
							size={14}
							strokeWidth={1.5}
							class="shrink-0 {active ? 'text-primary' : 'opacity-60'}"
						/>
					{/if}
					<span class="flex-1 truncate">{node.title}</span>
					{#if node.tag}
						<span
							class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide {tagClasses[node.tag]}"
							>{node.tag === 'new'
								? m.tag_new()
								: node.tag === 'beta'
									? m.tag_beta()
									: m.tag_deprecated()}</span
						>
					{/if}
				</a>
			</li>

		{:else if depth === 0}
			<li class="mt-5 first:mt-2">
				<p class="mb-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
					{node.title}
				</p>
				<NavTree
					nodes={node.children}
					depth={depth + 1}
					{openFolders}
					{currentPath}
					{tagClasses}
					{onToggle}
					{onClose}
				/>
			</li>

		{:else}
			<li>
				<button
					onclick={() => onToggle(node.slug)}
					class="flex w-full items-center gap-2 rounded-[var(--radius-sidebar-item)] px-2 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
				>
					{#if node.icon && icons[node.icon]}
						{@const Icon = icons[node.icon]}
						<Icon size={14} strokeWidth={1.5} class="shrink-0 opacity-60" />
					{/if}
					<span class="flex-1 truncate text-left">{node.title}</span>
					<ChevronRightIcon
						size={13}
						strokeWidth={1.5}
						class="shrink-0 text-muted-foreground transition-transform {isOpen ? 'rotate-90' : ''}"
					/>
				</button>
				{#if isOpen}
					<NavTree
						nodes={node.children}
						depth={depth + 1}
						{openFolders}
						{currentPath}
						{tagClasses}
						{onToggle}
						{onClose}
					/>
				{/if}
			</li>
		{/if}
	{/each}
</ul>
