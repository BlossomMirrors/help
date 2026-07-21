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
	import { SvelteSet } from 'svelte/reactivity';
	import { afterNavigate } from '$app/navigation';
	import { initMdComponents } from '$lib/md-helper';
	import { cn } from '$lib/utils';

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
	function buildServerToc(flat: { id: string; label: string; level: number }[]): TocItem[] {
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

	const serverToc = $derived(
		buildServerToc((page.data.headings as { id: string; label: string; level: number }[]) ?? [])
	);
	// Use live DOM toc once hydrated (has active state), fall back to server toc for SSR
	const displayToc = $derived(
		toc.current.length > 0 ? (toc.current as unknown as TocItem[]) : serverToc
	);

	const currentPath = $derived(page.url.pathname);
	const currentDocsetId = $derived(currentPath.split('/')[2] ?? getDocsetIds()[0] ?? 'user');
	const currentDocset = $derived(getDocsetMeta(currentDocsetId));
	const nav = $derived(getNav(currentDocsetId));

	let openFolders = new SvelteSet<string>();
	$effect(() => {
		openFolders.clear();
		function markOpen(nodes: NavNode[]) {
			for (const n of nodes) {
				if (n.children.length > 0) {
					const selfActive = n.href === currentPath;
					const childActive = flattenNav(n.children).some((c) => c.href === currentPath);
					if (selfActive || childActive) openFolders.add(n.slug);
					markOpen(n.children);
				}
			}
		}
		markOpen(nav);
	});

	function toggleFolder(slug: string) {
		if (openFolders.has(slug)) {
			openFolders.delete(slug);
		} else {
			openFolders.add(slug);
		}
	}

	const currentArticle = $derived(flattenNav(nav).find((n) => n.href === currentPath));

	const pageMetadata = $derived((page.data.metadata ?? {}) as Record<string, unknown>);
	const pageTitle = $derived(`${currentArticle?.title ?? 'Help'} - ${m.help_title()}`);
	const pageDescription = $derived(
		typeof pageMetadata.description === 'string' ? pageMetadata.description : m.hero_subtitle()
	);
	const ogImage = $derived(
		new URL(
			typeof pageMetadata.image === 'string' ? pageMetadata.image : '/og-image.png',
			page.url.origin
		).href
	);
	const headerImage = $derived(typeof pageMetadata.image === 'string' ? pageMetadata.image : null);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={page.url.href} />

	<meta property="og:type" content="article" />
	<meta property="og:site_name" content={m.help_title()} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>

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

		{#if headerImage}
			<enhanced:img
				src={headerImage}
				alt=""
				class="-mt-14 h-62 w-full object-cover object-center sm:h-86 mask-[linear-gradient(to_bottom,black_10%,transparent_95%)] block"
			/>
		{/if}

		<div class="flex flex-1">
			<main
				class={cn('min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12', headerImage && '-mt-10 sm:-mt-16')}
			>
				<article bind:this={articleEl} class={cn('prose max-w-3xl', headerImage && 'mt-3')}>
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
