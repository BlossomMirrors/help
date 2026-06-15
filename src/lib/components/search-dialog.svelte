<script lang="ts">
	import { onMount } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import { getNav, flattenNav, type NavNode } from '$lib/nav';
	import { icons } from '$lib/icons';
	import { getDocsetIds, getDocsetMeta } from '$lib/docsets';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
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
		return node.icon ? icons[node.icon] : BookOpenIcon;
	}
</script>

<Command.Dialog
	bind:open
	title={m.search_dialog_title()}
	description={m.search_dialog_description()}
>
	{#snippet children()}
		<Command.Input placeholder={m.search_placeholder()} />
		<div class="flex gap-1 border-y border-border px-3 py-1.5">
			{#each docsetIds as dsId (dsId)}
				<button
					onclick={() => (selectedDocset = dsId)}
					class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors {dsId ===
					selectedDocset
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
				>
					{getDocsetMeta(dsId).title}
				</button>
			{/each}
		</div>
		<Command.List>
			<Command.Empty>{m.search_no_results()}</Command.Empty>
			<Command.Group heading={currentDocset.title}>
				{#each allItems as item (item.href)}
					{@const Icon = iconComponent(item)}
					<Command.LinkItem
						href={item.href}
						value={item.title}
						onclick={() => (open = false)}
					>
						<Icon />
						<span>{item.title}</span>
						{#if item.tag}
							<span
								class="ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide
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
			class="flex items-center gap-3 border-t border-border px-3 py-2 text-[11px] text-muted-foreground"
		>
			<span class="flex items-center gap-1"
				><Kbd.Root>↑</Kbd.Root><Kbd.Root>↓</Kbd.Root> {m.kbd_navigate()}</span
			>
			<span class="flex items-center gap-1"><Kbd.Root>↵</Kbd.Root> {m.kbd_open()}</span>
			<span class="flex items-center gap-1"><Kbd.Root>Esc</Kbd.Root> {m.kbd_close()}</span>
		</div>
	</div>
	<Command.List>
		<Command.Empty>
			<p class="py-2 text-sm text-muted-foreground">{m.search_no_results()}</p>
		</Command.Empty>
		<Command.Group heading={currentDocset.title}>
			{#each allItems as item (item.href)}
				{@const Icon = iconComponent(item)}
				<Command.LinkItem
					href={item.href}
					value={item.title}
					onclick={() => (open = false)}
					class="flex items-center gap-2"
				>
					<Icon size={14} strokeWidth={1.5} class="shrink-0 text-muted-foreground" />
					<span class="flex-1 truncate">{item.title}</span>
					{#if item.tag}
						<span
							class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide
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
		class="border-t border-border px-3 py-2 flex items-center gap-3 text-[11px] text-muted-foreground"
	>
		<span class="flex items-center gap-1"
			><Kbd.Root>↑</Kbd.Root><Kbd.Root>↓</Kbd.Root> {m.kbd_navigate()}</span
		>
		<span class="flex items-center gap-1"><Kbd.Root>↵</Kbd.Root> {m.kbd_open()}</span>
		<span class="flex items-center gap-1"><Kbd.Root>Esc</Kbd.Root> {m.kbd_close()}</span>
	</div>
</Command.Dialog>
