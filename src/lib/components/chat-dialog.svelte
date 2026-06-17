<script lang="ts">
	import { onMount } from 'svelte';
	import { Dialog } from 'bits-ui';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import XIcon from '@lucide/svelte/icons/x';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import * as m from '$lib/paraglide/messages';
	import {
		Shimmer,
		Conversation,
		Message,
		PromptInput,
		Suggestion,
		Sources,
		type Source
	} from '$lib/components/ui/ai/index.js';

	type ChatMessage = {
		role: 'user' | 'assistant';
		content: string;
		sources: Source[];
		tools?: string[];
	};

	const TOOL_LABELS: Record<string, () => string> = {
		search_arc: m.tool_search_arc,
		get_pwas: m.tool_get_pwas,
		get_lutris_whitelist: m.tool_get_lutris_whitelist,
		get_homebrew_formula: m.tool_get_homebrew_formula,
		get_protondb_rating: m.tool_get_protondb_rating,
		get_anticheat_status: m.tool_get_anticheat_status,
		web_search: m.tool_search_web
	};

	const STORAGE_KEY = 'chat-history';

	let open = $state(false);
	let messages = $state<ChatMessage[]>([]);
	let streamingText = $state('');
	let streamingTools = $state<string[]>([]);
	let loading = $state(false);

	let conversation = $state<ReturnType<typeof Conversation> | null>(null);
	let promptInput = $state<ReturnType<typeof PromptInput> | null>(null);

	function loadMessages(): ChatMessage[] {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
		} catch {
			return [];
		}
	}

	function saveMessages(msgs: ChatMessage[]) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
		} catch (e) {
			void e;
		}
	}

	export function openChat() {
		window.dispatchEvent(new Event('open-chat'));
	}

	onMount(() => {
		messages = loadMessages();
		window.addEventListener('open-chat', () => (open = true));
	});

	$effect(() => {
		if (messages.length || streamingText) {
			conversation?.scrollToBottom(false);
		}
	});

	$effect(() => {
		saveMessages(messages);
	});

	$effect(() => {
		if (open) setTimeout(() => promptInput?.focus(), 60);
	});

	const SUGGESTIONS = $derived([
		m.chat_suggestion_steam(),
		m.chat_suggestion_drive(),
		m.chat_suggestion_anticheat(),
		m.chat_suggestion_windows()
	]);

	function parseResponse(raw: string): { content: string; sources: Source[] } {
		// Strip [WEB_REFS] block first (server-appended external sources)
		const webRefsMarker = '\n[WEB_REFS]\n';
		const webIdx = raw.indexOf(webRefsMarker);
		let webSources: Source[] = [];
		if (webIdx !== -1) {
			webSources = raw
				.slice(webIdx + webRefsMarker.length)
				.split('\n')
				.filter(Boolean)
				.map((line) => {
					const [url, title] = line.split('|').map((s) => s.trim());
					return { url, title: title ?? url };
				})
				.filter((s) => s.url?.startsWith('http'));
			raw = raw.slice(0, webIdx);
		}

		// Parse [REFS] block (AI-generated doc citations)
		const refsMarker = '\n[REFS]\n';
		const idx = raw.indexOf(refsMarker);
		if (idx === -1) return { content: raw.trimEnd(), sources: webSources };
		const content = raw.slice(0, idx).trimEnd();
		const docSources = raw
			.slice(idx + refsMarker.length)
			.split('\n')
			.filter(Boolean)
			.map((line) => {
				const [url, title, description] = line.split('|').map((s) => s.trim());
				return { url, title: title ?? url, description };
			})
			.filter((s) => s.url?.startsWith('/help/'));
		return { content, sources: [...docSources, ...webSources] };
	}

	// Strip \x01TOOLNAME\x01 markers and collect tool names
	function parseStream(raw: string): { text: string; tools: string[] } {
		const tools: string[] = [];
		const text = raw.replace(/\x01([^\x01]+)\x01/g, (_, name: string) => {
			if (!tools.includes(name)) tools.push(name);
			return '';
		});
		return { text, tools };
	}

	const streamingParsed = $derived(() => {
		const { text, tools } = parseStream(streamingText);
		return { ...parseResponse(text), tools };
	});

	async function send(text: string) {
		const msg = text.trim().slice(0, 800);
		if (!msg || loading) return;

		messages = [...messages, { role: 'user', content: msg, sources: [] }];
		loading = true;
		streamingText = '';
		streamingTools = [];

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: msg,
					history: messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
				})
			});

			if (!res.ok) {
				streamingText = (await res.text()) || 'Something went wrong. Please try again.';
			} else {
				const reader = res.body!.getReader();
				const dec = new TextDecoder();
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					streamingText += dec.decode(value, { stream: true });
					streamingTools = parseStream(streamingText).tools;
				}
			}
		} catch {
			streamingText = 'Connection error. Please try again.';
		}

		const { text: finalText, tools: usedTools } = parseStream(streamingText);
		const { content, sources } = parseResponse(finalText);
		messages = [...messages, { role: 'assistant', content, sources, tools: usedTools }];
		streamingText = '';
		streamingTools = [];
		loading = false;
	}

	function reset() {
		messages = [];
		streamingText = '';
		streamingTools = [];
		loading = false;
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (e) {
			void e;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm duration-150"
		/>
		<Dialog.Content
			interactOutsideBehavior="ignore"
			class="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-1/2 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-xl duration-150 outline-none"
			style="height: min(640px, 88vh);"
		>
			<!-- Header -->
			<div class="flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-3">
				<SparklesIcon size={16} class="shrink-0 text-primary" />
				<span class="flex-1 text-sm font-semibold">{m.chat_title()}</span>
				{#if messages.length > 0}
					<button
						onclick={reset}
						class="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						aria-label={m.chat_clear_conversation()}
					>
						<RotateCcwIcon size={13} />
					</button>
				{/if}
				<Dialog.Close
					class="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<XIcon size={15} />
				</Dialog.Close>
			</div>

			<!-- Messages -->
			<Conversation bind:this={conversation}>
				{#if messages.length === 0 && !loading}
					<div class="flex flex-col items-center py-8 text-center">
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
							<SparklesIcon size={22} class="text-primary" />
						</div>
						<p class="mb-1 font-semibold">{m.chat_welcome_heading()}</p>
						<p class="mb-6 text-sm text-muted-foreground">
							{m.chat_welcome_subtitle()}
						</p>
						<div class="flex flex-wrap justify-center gap-2">
							{#each SUGGESTIONS as s, i (i)}
								<Suggestion label={s} onclick={() => send(s)} />
							{/each}
						</div>
					</div>
				{:else}
					{#each messages as msg, i (i)}
						<div>
							{#if msg.role === 'assistant' && msg.tools && msg.tools.length > 0}
								<div class="ml-8 mb-1.5 flex flex-wrap gap-x-3 gap-y-1">
									{#each msg.tools as tool, i (i)}
										<span class="flex items-center gap-1 text-xs text-muted-foreground/60">
											<span class="inline-block h-1 w-1 rounded-full bg-muted-foreground/40"></span>
											{TOOL_LABELS[tool]?.() ?? tool}
										</span>
									{/each}
								</div>
							{/if}
							<Message role={msg.role} content={msg.content} />
							{#if msg.role === 'assistant' && msg.sources.length > 0}
								<Sources sources={msg.sources} />
							{/if}
						</div>
					{/each}

					{#if loading}
						<div>
							{#if streamingTools.length > 0}
								<div class="ml-8 mb-1.5 flex flex-wrap gap-x-3 gap-y-1">
									{#each streamingTools as tool, i (i)}
										<span class="flex items-center gap-1.5 text-xs text-muted-foreground">
											<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
											></span>
											{TOOL_LABELS[tool]?.() ?? tool}
										</span>
									{/each}
								</div>
							{/if}
							{#if streamingParsed().content}
								<Message role="assistant" content={streamingParsed().content} streaming />
								{#if streamingParsed().sources.length > 0}
									<Sources sources={streamingParsed().sources} />
								{/if}
							{:else if streamingTools.length === 0}
								<div class="flex gap-2.5">
									<div
										class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10"
									>
										<SparklesIcon size={12} class="text-primary" />
									</div>
									<div class="flex-1 pt-1">
										<Shimmer />
									</div>
								</div>
							{/if}
						</div>
					{/if}
				{/if}
			</Conversation>

			<!-- Input -->
			<PromptInput
				bind:this={promptInput}
				placeholder={m.chat_ask_placeholder()}
				onsubmit={send}
				disabled={loading}
			/>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
