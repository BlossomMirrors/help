<script lang="ts">
	import { onMount } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import { getNav, flattenNav, type NavNode } from '$lib/nav';
	import { icons } from '$lib/icons';
	import { getDocsetIds } from '$lib/docsets';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as m from '$lib/paraglide/messages';

	let open = $state(false);

	export function openSearch() {
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

	const docsetIds = $derived(getDocsetIds());
	const allItems = $derived(
		docsetIds.flatMap((id) => flattenNav(getNav(id)).filter((n) => n.href))
	);

	function iconComponent(node: NavNode) {
		return node.icon ? (icons[node.icon] ?? BookOpenIcon) : BookOpenIcon;
	}
</script>

<Command.Dialog
	bind:open
	title={m.search_dialog_title()}
	description={m.search_dialog_description()}
	class="rounded-xl"
>
	<Command.Input placeholder={m.search_placeholder()} class="h-10 text-base" />
	<Command.List class="max-h-96">
		<Command.Empty>
			<div class="flex flex-col items-center gap-2 py-10 text-muted-foreground">
				<SearchIcon size={28} strokeWidth={1.25} class="opacity-30" />
				<p class="text-sm">{m.search_no_results()}</p>
			</div>
		</Command.Empty>
		<Command.Group class="px-2">
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
							class="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase
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
