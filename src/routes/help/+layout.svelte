<script lang="ts">
	import { page } from '$app/state';
	import { getNav, flattenNav, type NavNode } from '$lib/nav';
	import { getDocsetIds, getDocsetMeta } from '$lib/docsets';
	import { setLocale, locales, getLocale } from '$lib/paraglide/runtime';
	import { UseToc } from '$lib/hooks/use-toc.svelte';
	import ScrollToTop from '$lib/components/ui/scroll-to-top.svelte';
	import * as Toc from '$lib/components/ui/toc/index.js';
	import Sidebar from '$lib/components/help/Sidebar.svelte';
	import HelpHeader from '$lib/components/help/HelpHeader.svelte';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	let { children } = $props();

	const alertLabels: Record<string, () => string> = {
		note: m.alert_note,
		tip: m.alert_tip,
		important: m.alert_important,
		warning: m.alert_warning,
		caution: m.alert_caution
	};

	function initMdComponents(root: HTMLElement) {
		root.querySelectorAll<HTMLElement>('.admonition-title[data-type]').forEach((el) => {
			const type = el.dataset.type ?? '';
			el.textContent = alertLabels[type]?.() ?? type;
		});
		root.querySelectorAll<HTMLElement>('pre code').forEach((code) => {
			const pre = code.parentElement;
			if (!pre || pre.querySelector('.copy-btn')) return;
			const btn = document.createElement('button');
			btn.className = 'copy-btn';
			btn.textContent = m.copy();
			btn.setAttribute('aria-label', m.aria_copy_code());
			btn.addEventListener('click', async () => {
				await navigator.clipboard.writeText(code.textContent ?? '');
				btn.textContent = m.copied();
				setTimeout(() => (btn.textContent = m.copy()), 2000);
			});
			pre.appendChild(btn);
		});
	}

	onMount(() => {
		if (articleEl) initMdComponents(articleEl);
	});
	afterNavigate(() => {
		if (articleEl) initMdComponents(articleEl);
	});

	$effect(() => {
		const labels: Record<string, string> = {
			note: m.alert_note(),
			tip: m.alert_tip(),
			important: m.alert_important(),
			warning: m.alert_warning(),
			caution: m.alert_caution()
		};
		articleEl?.querySelectorAll<HTMLElement>('.admonition-title[data-type]').forEach((el) => {
			el.textContent = labels[el.dataset.type ?? ''] ?? '';
		});
	});

	let sidebarOpen = $state(false);
	const toc = new UseToc();
	let articleEl = $state<HTMLElement | null>(null);
	$effect(() => {
		if (articleEl) toc.ref = articleEl;
	});

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

	const breadcrumbs = $derived.by(() => {
		const flat = flattenNav(nav);
		const firstDocsetPage = flat[0]?.href ?? `/help/${currentDocsetId}`;
		const segments = currentPath
			.replace(/^\/help\/[^/]+\/?/, '')
			.split('/')
			.filter(Boolean);
		const crumbs: { label: string; href: string }[] = [
			{ label: currentDocset.title, href: firstDocsetPage }
		];
		let href = `/help/${currentDocsetId}`;
		for (const seg of segments) {
			href += '/' + seg;
			const node = flat.find((n) => n.href === href);
			crumbs.push({ label: node?.title ?? seg, href });
		}
		return crumbs;
	});

	const currentArticle = $derived(flattenNav(nav).find((n) => n.href === currentPath));

	const languages = locales.map((code) => ({
		code,
		label: code === 'en' ? 'English' : code === 'de' ? 'Deutsch' : code
	}));
	let currentLocale = $state(getLocale());
	function handleLanguageChange(code: string) { setLocale(code as 'en' | 'de'); }
</script>

<svelte:head><title>{currentArticle?.title ?? 'Help'} — {m.help_title()}</title></svelte:head>

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
		{languages}
		{currentLocale}
		onToggleFolder={toggleFolder}
		onClose={() => (sidebarOpen = false)}
		onLanguageChange={handleLanguageChange}
	/>

	<div class="flex min-w-0 flex-1 flex-col lg:ml-0">
		<HelpHeader
			{sidebarOpen}
			{breadcrumbs}
			onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
		/>

		<div class="flex flex-1">
			<main class="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">
				<article bind:this={articleEl} class="prose max-w-3xl">
					{@render children()}
				</article>
			</main>

			{#if toc.current.length > 0}
				<aside
					class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 overflow-y-auto border-l border-border px-4 py-8 xl:block"
				>
					<p class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
						{m.on_this_page()}
					</p>
					<Toc.Root toc={toc.current} />
				</aside>
			{/if}
		</div>
	</div>
</div>

<ScrollToTop />
