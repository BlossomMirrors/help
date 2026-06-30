<script lang="ts">
	import { onMount } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import { getNav, flattenNav, type NavNode } from '$lib/nav';
	import { icons } from '$lib/icons';
	import { getDocsetIds, getDocsetMeta } from '$lib/docsets';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as m from '$lib/paraglide/messages';

	let open = $state(false);
	let selectedDocset = $state(getDocsetIds()[0] ?? 'user');

	export function openSearch(docset?: string) {
		if (docset) selectedDocset = docset;
		open = true;
	}

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				open = !open;
			}
		}
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	const allItems = $derived(flattenNav(getNav(selectedDocset)).filter((n) => n.href));
	const currentDocset = $derived(getDocsetMeta(selectedDocset));
	const docsetIds = $derived(getDocsetIds());

	function iconComponent(node: NavNode) {
		return node.icon ? (icons[node.icon] ?? BookOpenIcon) : BookOpenIcon;
	}

	function docsetIconComponent(id: string) {
		const meta = getDocsetMeta(id);
		return meta.icon ? (icons[meta.icon] ?? BookOpenIcon) : BookOpenIcon;
	}
</script>

<Command.Dialog
	bind:open
	title={m.search_dialog_title()}
	description={m.search_dialog_description()}
	class="rounded-xl"
>
	<Command.Input placeholder={m.search_placeholder()} class="h-10 text-base" />
	{#if docsetIds.length > 1}
		<div class="border-y border-border px-3 py-2">
			<div class="flex gap-1 rounded-lg bg-muted/40 p-0.5">
				{#each docsetIds as dsId (dsId)}
					{@const DocsetIcon = docsetIconComponent(dsId)}
					<button
						onclick={() => (selectedDocset = dsId)}
						class="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all {dsId ===
						selectedDocset
							? 'bg-popover text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'}"
					>
						<DocsetIcon size={12} strokeWidth={2} />
						{getDocsetMeta(dsId).title}
					</button>
				{/each}
			</div>
		</div>
	{/if}
	<Command.List class="max-h-80">
		<Command.Empty>
			<div class="flex flex-col items-center gap-2 py-10 text-muted-foreground">
				<SearchIcon size={28} strokeWidth={1.25} class="opacity-30" />
				<p class="text-sm">{m.search_no_results()}</p>
			</div>
		</Command.Empty>
		<Command.Group heading={currentDocset.title} class="px-2">
			{#each allItems as item (item.href)}
				{@const Icon = iconComponent(item)}
				<Command.LinkItem
					href={item.href}
					value={item.title}
					onclick={() => (open = false)}
					class="flex items-center gap-2.5 px-3 py-2"
				>
					<span class="flex size-6 shrink-0 items-center justify-center rounded bg-muted/60">
						<Icon size={12} strokeWidth={1.75} />
					</span>
					<span class="flex-1 truncate">{item.title}</span>
					{#if item.tag}
						<span
							class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
						{item.tag === 'beta' ? 'bg-primary/10 text-primary' : ''}
						{item.tag === 'new' ? 'bg-tertiary-700/10 text-tertiary-700 dark:text-tertiary-400' : ''}
						{item.tag === 'deprecated' ? 'bg-destructive/10 text-destructive' : ''}
					">{item.tag === 'new' ? m.tag_new() : item.tag === 'beta' ? m.tag_beta() : m.tag_deprecated()}</span
						>
					{/if}
				</Command.LinkItem>
			{/each}
		</Command.Group>
	</Command.List>
	<div
		class="flex items-center gap-4 border-t border-border bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground"
	>
		<span class="flex items-center gap-1"
			><Kbd.Root>↑</Kbd.Root><Kbd.Root>↓</Kbd.Root> {m.kbd_navigate()}</span
		>
		<span class="flex items-center gap-1"><Kbd.Root>↵</Kbd.Root> {m.kbd_open()}</span>
		<span class="flex items-center gap-1"><Kbd.Root>Esc</Kbd.Root> {m.kbd_close()}</span>
	</div>
</Command.Dialog>
