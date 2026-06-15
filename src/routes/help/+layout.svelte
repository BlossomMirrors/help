<script lang="ts">
	import { page } from '$app/state';
	import { getNav, flattenNav, type NavNode } from '$lib/nav';
	import { getDocsetIds, getDocsetMeta } from '$lib/docsets';
	import { UseToc } from '$lib/hooks/use-toc.svelte';
	import ScrollToTop from '$lib/components/ui/scroll-to-top.svelte';
	import * as Toc from '$lib/components/ui/toc/index.js';
	import type { TocItem } from '$lib/components/ui/toc/toc.svelte';
	import Sidebar from '$lib/components/help/Sidebar.svelte';
	import HelpHeader from '$lib/components/help/HelpHeader.svelte';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { initMdComponents } from '$lib/md-helper';

	let { children } = $props();

	onMount(() => {
		if (articleEl) initMdComponents(articleEl);
	});
	afterNavigate(() => {
		if (articleEl) initMdComponents(articleEl);
	});

	let sidebarOpen = $state(false);
	const toc = new UseToc();
	let articleEl = $state<HTMLElement | null>(null);
	$effect(() => {
		if (articleEl) toc.ref = articleEl;
	});

	// Build a nested TocItem tree from the flat server-side heading list.
	// No DOM required - renders in SSR immediately.
	function buildServerToc(
		flat: { id: string; label: string; level: number }[]
	): TocItem[] {
		const root: TocItem[] = [];
		const stack: { item: TocItem; level: number }[] = [];
		for (const h of flat) {
			const item: TocItem = { id: h.id, label: h.label, active: false, children: [] };
			while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop();
			if (stack.length === 0) root.push(item);
			else stack[stack.length - 1].item.children.push(item);
			stack.push({ item, level: h.level });
		}
		return root;
	}

	const serverToc = $derived(buildServerToc((page.data.headings as { id: string; label: string; level: number }[]) ?? []));
	// Use live DOM toc once hydrated (has active state), fall back to server toc for SSR
	const displayToc = $derived(toc.current.length > 0 ? (toc.current as unknown as TocItem[]) : serverToc);

	const currentPath = $derived(page.url.pathname);
	const currentDocsetId = $derived(currentPath.split('/')[2] ?? getDocsetIds()[0] ?? 'user');
	const currentDocset = $derived(getDocsetMeta(currentDocsetId));
	const nav = $derived(getNav(currentDocsetId));

	let openFolders = $state<Set<string>>(new Set());
	$effect(() => {
		const newOpen = new Set<string>();
		function markOpen(nodes: NavNode[]) {
			for (const n of nodes) {
				if (n.children.length > 0) {
					const selfActive = n.href === currentPath;
					const childActive = flattenNav(n.children).some((c) => c.href === currentPath);
					if (selfActive || childActive) newOpen.add(n.slug);
					markOpen(n.children);
				}
			}
		}
		markOpen(nav);
		openFolders = newOpen;
	});

	function toggleFolder(slug: string) {
		const next = new Set(openFolders);
		next.has(slug) ? next.delete(slug) : next.add(slug);
		openFolders = next;
	}

	const currentArticle = $derived(flattenNav(nav).find((n) => n.href === currentPath));
</script>

<svelte:head><title>{currentArticle?.title ?? 'Help'} - {m.help_title()}</title></svelte:head>

{#if sidebarOpen}
	<button
		class="fixed inset-0 z-30 bg-black/40 lg:hidden"
		onclick={() => (sidebarOpen = false)}
		aria-label={m.aria_close()}
	></button>
{/if}

<div class="flex min-h-screen bg-background">
	<Sidebar
		open={sidebarOpen}
		{nav}
		{currentDocsetId}
		{currentDocset}
		{currentPath}
		{openFolders}
		onToggleFolder={toggleFolder}
		onClose={() => (sidebarOpen = false)}
	/>

	<div class="flex min-w-0 flex-1 flex-col lg:ml-0">
		<HelpHeader
			{sidebarOpen}
			{nav}
			{currentDocsetId}
			{currentDocset}
			{currentPath}
			onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
		/>

		<div class="flex flex-1">
			<main class="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">
				<article bind:this={articleEl} class="prose max-w-3xl">
					{@render children()}
				</article>
			</main>

			{#if displayToc.length > 0}
				<aside
					class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 overflow-y-auto border-l border-border px-4 py-8 xl:block"
				>
					<p class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
						{m.on_this_page()}
					</p>
					<Toc.Root toc={displayToc} />
				</aside>
			{/if}
		</div>
	</div>
</div>

<ScrollToTop />
