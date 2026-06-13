<script lang="ts">
	import { getNav, flattenNav } from '$lib/nav';
	import { MagicCard } from '$lib/components/ui/magic-card/index.js';
	import ModeToggle from '$lib/components/ui/mode-toggle.svelte';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import { LanguageSwitcher } from '$lib/components/ui/language-switcher/index.js';
	import { setLocale, locales, getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import SearchIcon from '@lucide/svelte/icons/search';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import FolderIcon from '@lucide/svelte/icons/folder';
	import WrenchIcon from '@lucide/svelte/icons/wrench';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	const groupIcons = [BookOpenIcon, FolderIcon, WrenchIcon];

	const languages = locales.map((code) => ({
		code,
		label: code === 'en' ? 'English' : code === 'de' ? 'Deutsch' : code
	}));
	let currentLocale = $state(getLocale());

	function openSearch() {
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
	}
	function handleLanguageChange(code: string) {
		setLocale(code as 'en' | 'de');
	}

	const nav = $derived(getNav('user'));
	const groups = $derived(
		nav.filter((n) => n.slug !== '+page' && (n.children.length > 0 || n.href))
	);
	const allArticles = $derived(flattenNav(nav).filter((a) => a.slug !== '+page'));
</script>

<svelte:head><title>{m.help_title()}</title></svelte:head>

<div class="min-h-screen bg-background">
	<header class="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
			<a href="/" class="font-serif text-xl font-semibold text-foreground">{m.help_title()}</a>
			<div class="flex items-center gap-2">
				<LanguageSwitcher {languages} value={currentLocale} onChange={handleLanguageChange} />
				<ModeToggle />
			</div>
		</div>
	</header>

	<section class="relative overflow-hidden px-4 py-24">
		<div class="pointer-events-none absolute inset-0 -z-10">
			<div
				class="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/6 blur-3xl"
			></div>
		</div>
		<div class="mx-auto max-w-2xl text-center">
			<p class="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
				{m.help_center()}
			</p>
			<h1 class="mb-6 font-serif text-5xl leading-tight md:text-6xl">{m.hero_title()}</h1>
			<p class="mb-10 text-lg text-muted-foreground">{m.hero_subtitle()}</p>

			<button
				onclick={openSearch}
				class="group flex w-full cursor-text items-center gap-3 rounded-[var(--radius-card)] border border-border bg-card px-4 py-3.5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/3"
			>
				<SearchIcon size={18} strokeWidth={1.5} class="shrink-0 text-muted-foreground" />
				<span class="flex-1 text-sm text-muted-foreground">{m.search_placeholder()}</span>
				<span class="flex items-center gap-1"><Kbd.Root>⌘</Kbd.Root><Kbd.Root>K</Kbd.Root></span>
			</button>
		</div>
	</section>

	<section class="mx-auto max-w-6xl px-4 pb-16">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each groups as group, i (group.slug)}
				{@const Icon = groupIcons[i] ?? FolderIcon}
				{@const firstHref = group.href ?? group.children[0]?.href ?? '/help'}
				<MagicCard
					class="group flex flex-col rounded-[var(--radius-card)] border border-border bg-card transition-colors hover:border-primary/30"
				>
					<a href={firstHref} class="flex flex-1 flex-col p-6">
						<div
							class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
						>
							<Icon size={20} strokeWidth={1.5} />
						</div>
						<h2 class="mb-1 font-semibold">{group.title}</h2>
						<p class="mb-4 flex-1 text-sm text-muted-foreground">
							{m.articles_count({ count: flattenNav(group.children).length || 1 })}
						</p>
						<ul class="mb-4 space-y-1">
							{#each flattenNav([group]).slice(0, 2) as article (article.slug)}
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
						class="rounded-[var(--radius-card)] border border-border bg-card transition-colors hover:border-primary/30"
					>
						<a href={article.href} class="flex items-start gap-3 p-4">
							<div
								class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary"
							>
								<SearchIcon size={12} strokeWidth={1.5} />
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
