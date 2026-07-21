<script lang="ts">
	import { getNav, flattenNav } from '$lib/nav';
	import { getDocsetIds, getDocsetMeta } from '$lib/docsets';
	import { MagicCard } from '$lib/components/ui/magic-card/index.js';
	import ModeToggle from '$lib/components/ui/mode-toggle.svelte';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import { LanguageSwitcher } from '$lib/components/ui/language-switcher/index.js';
	import * as m from '$lib/paraglide/messages';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { icons } from '$lib/icons';
	import { page } from '$app/state';

	const ogImage = $derived(new URL('/og-image.png', page.url.origin).href);

	function openSearch() {
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
	}

	function openChat() {
		window.dispatchEvent(new Event('open-chat'));
	}

	const docsetIds = $derived(getDocsetIds());
	const allArticles = $derived(
		docsetIds.flatMap((id) => flattenNav(getNav(id)).filter((a) => a.slug !== '+page'))
	);
</script>

<svelte:head>
	<title>{m.help_title()}</title>
	<meta name="description" content={m.hero_subtitle()} />
	<link rel="canonical" href={page.url.href} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={m.help_title()} />
	<meta property="og:title" content={m.help_title()} />
	<meta property="og:description" content={m.hero_subtitle()} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={m.help_title()} />
	<meta name="twitter:description" content={m.hero_subtitle()} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>

<div class="min-h-screen bg-background">
	<header class="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
			<a href="/" class="font-serif text-xl font-semibold text-foreground mt-1">
				<img src="/logo.svg" alt="logo" class="h-8 inline align-middle mb-1 mr-2" />
				{m.help_title()}
			</a>
			<div class="flex items-center gap-2">
				<LanguageSwitcher />
				<ModeToggle />
			</div>
		</div>
	</header>

	<section class="relative overflow-hidden px-4 py-24">
		<div class="pointer-events-none absolute inset-0 -z-10">
			<div
				class="absolute left-1/2 top-0 h-100 w-150 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl"
			></div>
		</div>
		<div class="mx-auto max-w-2xl text-center">
			<p class="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
				{m.help_center()}
			</p>
			<h1 class="mb-6 font-serif text-5xl leading-tight md:text-6xl">{m.hero_title()}</h1>
			<p class="mb-10 text-lg text-muted-foreground">{m.hero_subtitle()}</p>

			<div class="flex gap-3">
				<button
					onclick={openSearch}
					class="group flex flex-1 cursor-text items-center gap-3 rounded-(--radius-card) border border-border bg-card px-4 py-3.5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/3"
				>
					<SearchIcon size={18} class="shrink-0 text-muted-foreground" />
					<span class="flex-1 text-sm text-muted-foreground">{m.search_placeholder()}</span>
					<span class="flex items-center gap-1"><Kbd.Root>⌘</Kbd.Root><Kbd.Root>K</Kbd.Root></span>
				</button>
				<button
					onclick={openChat}
					class="flex shrink-0 items-center gap-2 rounded-(--radius-card) border border-border bg-card px-4 py-3.5 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/3"
				>
					<SparklesIcon size={18} class="text-primary" />
					<span class="text-sm font-medium text-foreground">{m.ask_ai()}</span>
				</button>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-6xl px-4 pb-16">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each docsetIds as id (id)}
				{@const meta = getDocsetMeta(id)}
				{@const nav = getNav(id)}
				{@const articles = flattenNav(nav).filter((a) => a.slug !== '+page')}
				{@const DocIcon = (meta.icon ? icons[meta.icon] : undefined) ?? BookOpenIcon}
				<MagicCard
					class="group flex flex-col rounded-(--radius-card) border border-border bg-card transition-colors hover:border-primary/30"
				>
					<a href="/help/{id}" class="flex flex-1 flex-col p-6">
						<div
							class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
						>
							<DocIcon size={20} strokeWidth={1.5} />
						</div>
						<h2 class="mb-1 font-semibold">{meta.title}</h2>
						<p class="mb-4 flex-1 text-sm text-muted-foreground">
							{m.articles_count({ count: articles.length || 1 })}
						</p>
						<ul class="mb-4 space-y-1">
							{#each articles.slice(0, 2) as article (article.slug)}
								<li class="truncate text-xs text-muted-foreground">· {article.title}</li>
							{/each}
						</ul>
						<div class="flex items-center gap-1 text-sm font-medium text-primary">
							{m.browse()}
							<ArrowRightIcon size={14} class="transition-transform group-hover:translate-x-1" />
						</div>
					</a>
				</MagicCard>
			{/each}
		</div>

		<div class="mt-16">
			<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
				{m.all_articles_title()}
			</p>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each allArticles as article (article.href)}
					<MagicCard
						class="rounded-(--radius-card) border border-border bg-card transition-colors hover:border-primary/30"
					>
						<a href={article.href} class="flex items-start gap-3 p-4">
							<div
								class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary"
							>
								<SearchIcon size={12} />
							</div>
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<p class="truncate text-sm font-medium">{article.title}</p>
									{#if article.tag}
										<span
											class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide
											{article.tag === 'beta' ? 'bg-primary/10 text-primary' : ''}
											{article.tag === 'new' ? 'bg-tertiary-700/10 text-tertiary-700 dark:text-tertiary-400' : ''}
											{article.tag === 'deprecated' ? 'bg-destructive/10 text-destructive' : ''}
										"
											>{article.tag === 'new'
												? m.tag_new()
												: article.tag === 'beta'
													? m.tag_beta()
													: m.tag_deprecated()}</span
										>
									{/if}
								</div>
							</div>
						</a>
					</MagicCard>
				{/each}
			</div>
		</div>
	</section>

	<footer class="border-t border-border px-4 py-8">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row"
		>
			<span>{m.footer_copyright({ year: new Date().getFullYear() })}</span>
			<div class="flex gap-4">
				<!-- <a href="/help/user/troubleshooting" class="transition-colors hover:text-foreground">Support</a> -->
				<!-- <a href="/help" class="transition-colors hover:text-foreground">Help</a> -->
			</div>
		</div>
	</footer>
</div>
