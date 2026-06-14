<script lang="ts">
	import type { NavNode, NavTag } from '$lib/nav';
	import type { DocsetMeta } from '$lib/docsets';
	import NavTree from '$lib/components/help/NavTree.svelte';
	import DocsetSwitcher from '$lib/components/help/DocsetSwitcher.svelte';
	import { LanguageSwitcher } from '$lib/components/ui/language-switcher/index.js';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import ModeToggle from '$lib/components/ui/mode-toggle.svelte';
	import HomeIcon from '@lucide/svelte/icons/house';
	import XIcon from '@lucide/svelte/icons/x';
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as m from '$lib/paraglide/messages';
	import favicon from '$lib/assets/favicon.svg';

	type Props = {
		open: boolean;
		nav: NavNode[];
		currentDocsetId: string;
		currentDocset: DocsetMeta;
		currentPath: string;
		openFolders: Set<string>;
		onToggleFolder: (slug: string) => void;
		onClose: () => void;
	};

	let {
		open,
		nav,
		currentDocsetId,
		currentDocset,
		currentPath,
		openFolders,
		onToggleFolder,
		onClose
	}: Props = $props();

	const tagClasses: Record<NavTag, string> = {
		beta: 'bg-primary/10 text-primary',
		new: 'bg-tertiary-700/10 text-tertiary-700 dark:text-tertiary-400',
		deprecated: 'bg-destructive/10 text-destructive'
	};

	function openSearch() {
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
	}
</script>

<aside
	class={[
		'fixed top-0 left-0 z-30 flex h-screen w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200',
		'lg:sticky lg:translate-x-0',
		open ? 'translate-x-0' : '-translate-x-full'
	].join(' ')}
>
	<div class="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
		<img src={favicon} alt="Blossom" class="h-6 w-6 shrink-0" />
		<span class="flex-1 truncate font-serif text-base font-semibold text-sidebar-foreground"
			>{m.help_title()}</span
		>
		<button
			onclick={onClose}
			class="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
			aria-label={m.aria_close()}><XIcon size={16} strokeWidth={1.5} /></button
		>
	</div>

	<div class="shrink-0 px-3 pt-3">
		<button
			onclick={openSearch}
			class="flex w-full items-center gap-2.5 rounded-[var(--radius-menu)] border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted"
			aria-label={m.aria_search()}
		>
			<SearchIcon size={14} strokeWidth={1.5} class="shrink-0" />
			<span class="flex-1 text-left">{m.search_placeholder()}</span>
			<span class="flex items-center gap-0.5 text-xs opacity-60"
				><Kbd.Root>⌘</Kbd.Root><Kbd.Root>K</Kbd.Root></span
			>
		</button>
	</div>

	<div class="shrink-0 px-3 pt-2 pb-3">
		<DocsetSwitcher {currentDocsetId} {currentDocset} />
	</div>

	<nav class="flex-1 overflow-y-auto px-3 pb-4">
		<NavTree
			nodes={nav}
			depth={0}
			{openFolders}
			{currentPath}
			{tagClasses}
			onToggle={onToggleFolder}
			{onClose}
		/>
	</nav>

	<div class="flex shrink-0 items-center gap-1 border-t border-border px-3 py-2">
		<a
			href="/"
			class="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
			aria-label={m.back_to_home()}><HomeIcon size={15} strokeWidth={1.5} /></a
		>
		<div class="flex-1"></div>
		<LanguageSwitcher />
		<ModeToggle />
	</div>
</aside>
