<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import * as m from '$lib/paraglide/messages';

	let { placeholder = 'Search a game on ProtonDB...' }: { placeholder?: string } = $props();

	type Game = { appId: number; title: string; image: string | null };

	let query = $state('');
	let results = $state<Game[]>([]);
	let activeIndex = $state(0);
	let focused = $state(false);
	let containerEl: HTMLDivElement | null = null;
	let inputEl: HTMLInputElement | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let latestQuery = '';

	async function runSearch(q: string) {
		if (!q) {
			results = [];
			activeIndex = 0;
			return;
		}
		try {
			const res = await fetch(`/api/steam-search?q=${encodeURIComponent(q)}`);
			const data = (await res.json()) as Game[];
			if (q === latestQuery) {
				results = data;
				activeIndex = 0;
			}
		} catch {
			if (q === latestQuery) {
				results = [];
				activeIndex = 0;
			}
		}
	}

	function onInput() {
		const q = query.trim();
		latestQuery = q;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => runSearch(q), 250);
	}

	const showDropdown = $derived(focused && query.trim().length > 0);

	let suppressBlur = false;

	function openGame(appId: number) {
		suppressBlur = true;
		window.open(`https://www.protondb.com/app/${appId}`, '_blank', 'noopener,noreferrer');
		setTimeout(() => (suppressBlur = false), 0);
	}

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		const trimmed = query.trim();
		if (!trimmed) return;
		if (results.length > 0) {
			openGame(results[activeIndex]?.appId ?? results[0].appId);
			return;
		}
		window.open(
			`https://www.protondb.com/search?q=${encodeURIComponent(trimmed)}`,
			'_blank',
			'noopener,noreferrer'
		);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			focused = false;
			(e.currentTarget as HTMLInputElement).blur();
			return;
		}
		if (results.length === 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = (activeIndex + 1) % results.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = (activeIndex - 1 + results.length) % results.length;
		}
	}

	function clearQuery() {
		query = '';
		results = [];
		activeIndex = 0;
		inputEl?.focus();
	}

	function handleFocusOut(e: FocusEvent) {
		if (suppressBlur) return;
		if (containerEl && e.relatedTarget instanceof Node && containerEl.contains(e.relatedTarget)) {
			return;
		}
		focused = false;
	}
</script>

<div class="not-prose relative my-4" bind:this={containerEl} onfocusout={handleFocusOut}>
	<form onsubmit={handleSearch} class="relative">
		<SearchIcon
			size={16}
			class={`pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground ${focused ? 'text-ring' : ''}`}
		/>
		<input
			type="text"
			bind:this={inputEl}
			bind:value={query}
			oninput={onInput}
			onfocus={() => (focused = true)}
			onkeydown={handleKeydown}
			{placeholder}
			class="w-full rounded-lg border border-border bg-card px-9 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
		/>
		{#if query.length > 0}
			<button
				type="button"
				onclick={clearQuery}
				aria-label={m.clear_search()}
				class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
			>
				<XIcon size={14} />
			</button>
		{/if}
	</form>

	{#if showDropdown}
		<div
			class="absolute z-20 mt-3 w-full overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
		>
			{#if results.length > 0}
				<ul class="pt-4 pr-6">
					{#each results as game, i (game.appId)}
						<li class="list-none m-0">
							<button
								type="button"
								onclick={() => openGame(game.appId)}
								onmouseenter={() => (activeIndex = i)}
								class={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm cursor-pointer rounded-md ${i === activeIndex ? 'bg-black/10' : ''}`}
							>
								{#if game.image}
									<img src={game.image} alt="" class="h-8 w-14 shrink-0 rounded-sm object-cover" />
								{:else}
									<span class="h-8 w-14 shrink-0 rounded bg-muted"></span>
								{/if}
								<span class="truncate">{game.title}</span>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="px-8 py-2 mt-4 text-sm text-muted-foreground">
					{m.no_matching_games()}
				</p>
			{/if}
		</div>
	{/if}
</div>
