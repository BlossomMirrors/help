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
	import MessagesSquareIcon from '@lucide/svelte/icons/messages-square';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import AtSignIcon from '@lucide/svelte/icons/at-sign';
	import { icons } from '$lib/icons';
	import { page } from '$app/state';

	const communityLinks = [
		{
			href: 'https://community.blossomos.org',
			Icon: MessagesSquareIcon,
			title: m.community_forum_title(),
			desc: m.community_forum_desc()
		},
		{
			href: 'https://discord.gg/dTqsBdxvNr',
			Icon: MessageCircleIcon,
			title: m.community_discord_title(),
			desc: m.community_discord_desc()
		},
		{
			href: 'https://bsky.app/profile/blossomos.org',
			Icon: AtSignIcon,
			title: m.community_bluesky_title(),
			desc: m.community_bluesky_desc()
		}
	];

	const ogImage = $derived(new URL('/og-image.png', page.url.origin).href);

	function openSearch() {
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
	}

	function openChat() {
		window.dispatchEvent(new Event('open-chat'));
	}

	const docsetIds = $derived(getDocsetIds());
	const docsetData = $derived(
		docsetIds.map((id) => ({
			id,
			meta: getDocsetMeta(id),
			articles: flattenNav(getNav(id)).filter((a) => a.slug !== '+page')
		}))
	);
	const allArticles = $derived(docsetData.flatMap((d) => d.articles));

	function bentoClass(i: number) {
		if (i === 0) return 'md:col-span-2 md:row-span-2';
		if (i === 1) return 'md:col-span-2';
		return '';
	}

	const heroCollage = [
		{ src: '/covers/handbook.jpg', pos: 'top-6 left-[5%] w-36 h-44', rotate: '-rotate-6' },
		{ src: '/covers/gaming.jpg', pos: 'top-48 left-[0%] w-28 h-28', rotate: 'rotate-3' },
		{ src: '/covers/clouds.jpg', pos: 'bottom-4 left-[9%] w-32 h-40', rotate: 'rotate-2' },
		{ src: '/covers/usb.jpg', pos: 'top-2 right-[5%] w-32 h-40', rotate: 'rotate-6' },
		{ src: '/covers/robot.jpg', pos: 'top-44 right-[0%] w-28 h-28', rotate: '-rotate-3' },
		{ src: '/covers/deck.jpg', pos: 'bottom-6 right-[8%] w-36 h-44', rotate: '-rotate-2' }
	];
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
			<a href="/" class="mt-1 font-serif text-xl font-semibold text-foreground">
				<img
					src="/logo.svg"
					alt="logo"
					class="mb-1 mr-2 inline h-8 align-middle transition-transform duration-300 hover:rotate-12"
				/>
				{m.help_title()}
			</a>
			<div class="flex items-center gap-2">
				<LanguageSwitcher />
				<ModeToggle />
			</div>
		</div>
	</header>

	<section class="relative overflow-hidden px-4 py-28">
		<div class="pointer-events-none absolute inset-0 -z-10">
			<div
				class="hero-blob absolute left-[15%] top-0 h-100 w-100 rounded-full bg-primary/10 blur-3xl"
			></div>
			<div
				class="hero-blob-alt absolute right-[10%] top-20 h-80 w-80 rounded-full bg-tertiary-500/8 blur-3xl"
			></div>
			{#each heroCollage as chip, i (chip.src)}
				<div
					class="hero-float absolute hidden lg:block {chip.pos}"
					style="animation-delay: {i * 400}ms"
				>
					<div
						class="h-full w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-border/50 transition-all duration-500 {chip.rotate} hover:z-10 hover:scale-110 hover:rotate-0 hover:shadow-2xl"
					>
						<img src={chip.src} alt="" class="h-full w-full object-cover" />
					</div>
				</div>
			{/each}
			<div
				class="absolute inset-0 bg-linear-to-b from-background/30 via-background/70 to-background"
			></div>
		</div>
		<div class="relative mx-auto max-w-2xl text-center">
			<p
				class="animate-in fade-in slide-in-from-bottom-4 mb-3 text-xs font-semibold uppercase tracking-widest text-primary duration-700 fill-mode-both"
			>
				{m.help_center()}
			</p>
			<h1
				class="animate-in fade-in slide-in-from-bottom-6 mb-6 font-serif text-5xl leading-tight duration-700 delay-100 fill-mode-both md:text-6xl"
			>
				{m.hero_title()}
			</h1>
			<p
				class="animate-in fade-in slide-in-from-bottom-6 mb-10 text-lg text-muted-foreground duration-700 delay-200 fill-mode-both"
			>
				{m.hero_subtitle()}
			</p>

			<div
				class="animate-in fade-in slide-in-from-bottom-6 flex gap-3 duration-700 delay-300 fill-mode-both"
			>
				<button
					onclick={openSearch}
					class="group flex flex-1 cursor-text items-center gap-3 rounded-(--radius-card) border border-border bg-card px-4 py-3.5 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-primary/3 pointer-cursor"
				>
					<SearchIcon size={18} class="shrink-0 text-muted-foreground" />
					<span class="flex-1 text-sm text-muted-foreground">{m.search_placeholder()}</span>
					<span class="flex items-center gap-1"><Kbd.Root>⌘</Kbd.Root><Kbd.Root>K</Kbd.Root></span>
				</button>
				<button
					onclick={openChat}
					class="flex shrink-0 items-center gap-2 rounded-(--radius-card) border border-border bg-card px-4 py-3.5 shadow-sm transition-all hover:border-primary/40 hover:bg-primary/3 pointer-cursor"
				>
					<SparklesIcon size={18} class="text-primary" />
					<span class="text-sm font-medium text-foreground">{m.ask_ai()}</span>
				</button>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-6xl px-4 pb-20">
		<div class="grid grid-cols-1 gap-5 md:grid-cols-4 md:auto-rows-[15rem]">
			{#each docsetData as { id, meta, articles }, i (id)}
				{@const DocIcon = (meta.icon ? icons[meta.icon] : undefined) ?? BookOpenIcon}
				<div
					class="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both {bentoClass(
						i
					)}"
					style="animation-delay: {i * 130}ms"
				>
					<MagicCard
						class="group relative h-full overflow-hidden rounded-(--radius-card) border border-border bg-card"
					>
						<a href="/help/{id}" class="relative flex h-64 flex-col md:h-full">
							{#if meta.image}
								<div class="relative min-h-16 w-full flex-1">
									<img
										src={meta.image}
										alt=""
										class="mask-[linear-gradient(to_bottom,black_10%,transparent_95%)] absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
									<div
										class="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-card/80 text-primary ring-1 ring-border/50 backdrop-blur-sm"
									>
										<DocIcon size={16} strokeWidth={2} />
									</div>
								</div>
							{:else}
								<div class="p-5 pb-0">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
									>
										<DocIcon size={20} strokeWidth={2} />
									</div>
								</div>
							{/if}
							<div class="shrink-0 p-5" class:pt-3={meta.image}>
								<h2 class="font-serif text-lg font-semibold text-foreground md:text-xl">
									{meta.title}
								</h2>
								{#if meta.description}
									<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{meta.description}</p>
								{/if}
								<p class="mt-1 text-xs text-muted-foreground/70">
									{m.articles_count({ count: articles.length || 1 })}
								</p>
								<div class="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
									{m.browse()}
									<ArrowRightIcon
										size={14}
										class="transition-transform group-hover:translate-x-1"
									/>
								</div>
							</div>
						</a>
					</MagicCard>
				</div>
			{/each}
		</div>

		<div class="mt-20">
			<h3 class="mb-1 font-serif text-lg font-semibold">{m.community_title()}</h3>
			<p class="mb-6 text-sm text-muted-foreground">{m.community_subtitle()}</p>
			<div class="grid gap-4 sm:grid-cols-3">
				{#each communityLinks as link, ci (link.href)}
					<div
						class="animate-in fade-in slide-in-from-bottom-4 h-full duration-500 fill-mode-both"
						style="animation-delay: {ci * 100}ms"
					>
						<MagicCard
							class="group h-full rounded-(--radius-card) border border-border bg-card transition-colors hover:border-primary/30"
						>
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								class="flex h-full items-start gap-3 p-5"
							>
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110"
								>
									<link.Icon size={18} strokeWidth={2} />
								</div>
								<div class="min-w-0">
									<p class="font-medium">{link.title}</p>
									<p class="mt-0.5 text-sm text-muted-foreground">{link.desc}</p>
								</div>
							</a>
						</MagicCard>
					</div>
				{/each}
			</div>
		</div>

		<div class="mt-20">
			<h3 class="mb-6 font-serif text-lg font-semibold">{m.all_articles_title()}</h3>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{#each allArticles as article, ai (article.href)}
					{@const ArticleIcon = (article.icon ? icons[article.icon] : undefined) ?? SearchIcon}
					<a
						href={article.href}
						class="animate-in fade-in slide-in-from-bottom-4 group flex flex-col overflow-hidden rounded-(--radius-card) border border-border bg-card transition-transform duration-500 fill-mode-both hover:-translate-y-1"
						style="animation-delay: {Math.min(ai * 40, 600)}ms"
					>
						{#if article.image}
							<div class="relative h-20 w-full shrink-0">
								<img
									src={article.image}
									alt=""
									class="mask-[linear-gradient(to_bottom,black_10%,transparent_95%)] absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>
								{#if article.tag}
									<span
										class="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
										{article.tag === 'beta' ? 'bg-primary text-primary-foreground' : ''}
										{article.tag === 'new' ? 'bg-tertiary-500 text-white' : ''}
										{article.tag === 'deprecated' ? 'bg-destructive text-white' : ''}
									"
									>
										{article.tag === 'new'
											? m.tag_new()
											: article.tag === 'beta'
												? m.tag_beta()
												: m.tag_deprecated()}
									</span>
								{/if}
							</div>
							<div class="flex items-center gap-2 p-3">
								<ArticleIcon size={14} class="shrink-0 text-primary" />
								<p class="truncate text-sm font-medium">{article.title}</p>
							</div>
						{:else}
							<div class="flex items-center gap-2 p-3">
								<ArticleIcon size={16} class="shrink-0 text-primary" />
								<p class="truncate text-sm font-medium">{article.title}</p>
							</div>
						{/if}
					</a>
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

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-14px);
		}
	}

	.hero-float {
		animation: float 6s ease-in-out infinite;
	}

	@keyframes drift {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(40px, -25px) scale(1.08);
		}
		66% {
			transform: translate(-25px, 20px) scale(0.95);
		}
	}

	.hero-blob {
		animation: drift 18s ease-in-out infinite;
	}

	.hero-blob-alt {
		animation: drift 22s ease-in-out infinite reverse;
	}
</style>
