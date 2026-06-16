import Anthropic from '@anthropic-ai/sdk';
import type { ToolUnion, MessageParam, ToolUseBlock } from '@anthropic-ai/sdk/resources';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
const rl = new Map<string, { n: number; t: number }>();

// Load all doc content at module init (build-time glob, zero runtime I/O)
const rawDocs = import.meta.glob<string>('/content/en/**/*.svx', {
	query: '?raw',
	import: 'default',
	eager: true
});

function buildDocsContext(): string {
	const pages: string[] = [];
	for (const [path, raw] of Object.entries(rawDocs)) {
		const slug = path
			.replace('/content/en/', '')
			.replace(/\/\+page\.svx$/, '')
			.replace(/\.svx$/, '');
		const helpUrl = `/help/${slug}`;
		const title = raw.match(/^---[\s\S]*?title:\s*(.+)/m)?.[1]?.trim() ?? slug;
		const content = raw
			.replace(/^---[\s\S]*?---\n?/, '')
			.replace(/<script[\s\S]*?<\/script>/gi, '')
			.replace(/<style[\s\S]*?<\/style>/gi, '')
			.replace(/<[A-Z][A-Za-z0-9]*[^>]*\/?>/g, '')
			.trim();
		pages.push(`### [${title}](${helpUrl})\n\n${content}`);
	}
	return pages.join('\n\n---\n\n');
}

const DOCS = buildDocsContext();

const SYSTEM = `You are the help assistant for BlossomOS - a Fedora Kinoite-based (atomic/immutable) desktop OS for everyday use.

**Always call the OS "BlossomOS". Never say "Linux" to the user — they are using BlossomOS, not Linux.**

## BlossomOS Platform

**Arc Store** - One-click unified software manager with integrated Flathub. Installs Flatpaks, AppImages, .deb/.rpm via Distrobox, web apps, and pre-configured Windows apps.

**pkglayer** - Layers package managers (apt, yay, nix, emerge, dnf) via Distrobox. Commands feel native, zero host impact.

**Immutable Base** - Fedora Kinoite with atomic updates. Rollback to any previous version instantly.

**BlossomUI** - Modern KDE Plasma redesign with unified theme.

**Helium Browser** - Default browser (Ungoogled Chromium, no Google telemetry).

**Blossom Cloud** - EU-hosted E2E-encrypted file sync, collaborative docs, and Jitsi video calls. Powered by Nextcloud. Setup: create account at blossomos.org/cloud, then install Nextcloud from Arc Store (appstream://com.nextcloud.desktopclient.nextcloud) and sign in.

**Blossom Hub (WIP)** - MDM with central auth, policy enforcement, remote rollout.

## Tone and Skill Level

Read the user's message and calibrate accordingly:
- **Beginner** (vague questions, no technical terms, asks "how do I..."): give step-by-step plain-language answers, no jargon, no mention of underlying technology unless it helps them
- **Experienced** (uses correct terms, asks specific questions): be direct and technical

Don't explain what something is unless they asked. If they ask "can I get WhatsApp?" just tell them yes and how. Don't call it a PWA, don't explain how it works — they don't care.

Don't volunteer technical details proactively. Answer what was asked, nothing more.

## How to Help Users

**Always use Arc's own tools first. If they return nothing useful, you MUST fall back to web_search — never give up without trying it.**

### For any app or software question:
1. **get_pwas** — check Arc Store's web services list first
2. **search_arc** — check Arc Store for Flatpak, native, or Windows packages
3. **get_lutris_whitelist** — if not in Arc, check Lutris (covers Windows apps and games)
4. **get_homebrew_formula** — for CLI tools not found in Arc
5. **web_search** — if none of the above found it, search the web. Always include "Linux" or "Fedora" in the query. Never skip this step just because Arc had no results — there are always Linux alternatives or workarounds worth finding.

### For gaming questions:
1. **search_arc** — check if available via Arc (Steam, Heroic, Lutris are all in Arc)
2. **get_lutris_whitelist** — for specific Windows game compatibility
3. **get_anticheat_status** — for any game with multiplayer or an anti-cheat system, check this before recommending it. A "Denied" status means the developer has actively blocked Linux/Proton — the game will never run, no matter what ProtonDB says. Never recommend or list as an alternative a game with "Denied" status; "Broken" means it doesn't currently work but isn't permanently blocked. Only recommend a cloud gaming service if the result's cloudGaming field names one for that game — never suggest cloud gaming speculatively.
4. **get_protondb_rating** — check Linux/Proton compatibility by Steam App ID; use web_search first if you need to find the Steam App ID. Note ProtonDB tiers can be stale and don't reflect anti-cheat blocks added after older reports — always cross-check with get_anticheat_status for anti-cheat-protected games.
5. **web_search** — for anything not covered above; add "Linux Proton" or "Steam Deck" to queries for gaming context

**If Arc tools return no results for something: do not immediately tell the user it's unavailable. Use web_search to find Linux alternatives or workarounds first.**

**Don't describe apps as "PWAs" or "web apps"** unless the user asked — just say "it's available in Arc Store."

**When you confirm an app is available, always include an appstream:// install link** using markdown link syntax:
- Flatpak: [Open in Arc](appstream://com.example.App)
- PWA/web service: [Open in Arc](appstream://pwa:com.example.App) — use the id field from get_pwas results
- Lutris: [Open in Arc](appstream://lutris:game-slug) — use the slug from get_lutris_whitelist results

**Link to help docs** using the citation format below (only cite pages that actually exist).

## Citation Format
At the very end of your response (nothing after it), if you referenced any help pages, add:

[REFS]
/help/path|Page Title|One-line description

One line per source.

## Full Documentation

${DOCS}`;

const tools: ToolUnion[] = [
	// Arc Store — check these first before anything else
	{
		name: 'get_pwas',
		description:
			'Get live list of web services available in Arc Store (Netflix, WhatsApp, YouTube, etc.). Check this first for any web service or streaming question.',
		input_schema: { type: 'object', properties: {} }
	},
	{
		name: 'search_arc',
		description:
			'Search Arc Store for Flatpak apps, native packages, and Windows apps. Use this for any desktop app or software question.',
		input_schema: {
			type: 'object',
			properties: {
				query: { type: 'string', description: 'App name, package name, or keyword' }
			},
			required: ['query']
		}
	},
	{
		name: 'get_lutris_whitelist',
		description:
			'Get the list of Windows apps and games available via Lutris on BlossomOS. Use when search_arc finds nothing.',
		input_schema: { type: 'object', properties: {} }
	},
	// Homebrew — for CLI tools not in Arc
	{
		name: 'get_homebrew_formula',
		description:
			'Check if a CLI tool or package is available via Homebrew (brew). Use for developer tools and CLI utilities after checking Arc Store.',
		input_schema: {
			type: 'object',
			properties: {
				name: { type: 'string', description: 'Exact package name to look up' }
			},
			required: ['name']
		}
	},
	// Are We Anti-Cheat Yet — whether a game's anti-cheat blocks Linux/Proton
	{
		name: 'get_anticheat_status',
		description:
			"Check Are We Anti-Cheat Yet for whether a game's anti-cheat blocks Linux/Proton. Use for any multiplayer game or one with an anti-cheat system before recommending it.",
		input_schema: {
			type: 'object',
			properties: {
				game: { type: 'string', description: 'Game name to search for' }
			},
			required: ['game']
		}
	},
	// ProtonDB — for Steam game Linux compatibility
	{
		name: 'get_protondb_rating',
		description:
			'Get the ProtonDB community rating for a Steam game (how well it runs on Linux via Proton). Requires the numeric Steam App ID.',
		input_schema: {
			type: 'object',
			properties: {
				steam_app_id: {
					type: 'string',
					description: 'Numeric Steam App ID (e.g. 292030 for The Witcher 3)'
				}
			},
			required: ['steam_app_id']
		}
	},
	// Built-in Claude web search — no API key needed, Anthropic handles it server-side
	{ type: 'web_search_20250305', name: 'web_search' }
];

type AnticheatGame = {
	name: string;
	status: string;
	native: boolean;
	anticheats: string[];
	notes?: [string, string][];
};

const CLOUD_GAMING_RE =
	/geforce now|xbox[\s-]?cloud|boosteroid|luna|shadow\.tech|playstation plus cloud/i;

function findCloudGaming(notes: [string, string][] | undefined): string[] {
	if (!notes) return [];
	return notes.filter(([text]) => CLOUD_GAMING_RE.test(text)).map(([text]) => text);
}

let anticheatCache: { games: AnticheatGame[]; ts: number } | null = null;
const ANTICHEAT_TTL = 60 * 60 * 1000;

async function getAnticheatGames(): Promise<AnticheatGame[]> {
	if (anticheatCache && Date.now() - anticheatCache.ts < ANTICHEAT_TTL) {
		return anticheatCache.games;
	}
	const res = await fetch(
		'https://raw.githubusercontent.com/AreWeAntiCheatYet/AreWeAntiCheatYet/master/games.json'
	);
	if (!res.ok) throw new Error('Are We Anti-Cheat Yet data unavailable');
	const games = (await res.json()) as AnticheatGame[];
	anticheatCache = { games, ts: Date.now() };
	return games;
}

async function callTool(toolName: string, toolInput: Record<string, unknown>): Promise<string> {
	try {
		if (toolName === 'search_arc') {
			const query = String(toolInput.query || '');
			const res = await fetch(
				`https://arpi.blossomos.org/api/v1/search?q=${encodeURIComponent(query)}`
			);
			if (!res.ok) return 'Arc search unavailable';
			const results = await res.json();
			if (!Array.isArray(results)) return 'No results';
			return JSON.stringify(results.slice(0, 10), null, 2);
		}

		if (toolName === 'get_pwas') {
			const res = await fetch('https://forge.blossomos.org/api/pwas');
			if (!res.ok) return 'PWA list unavailable';
			const pwas = await res.json();
			if (!Array.isArray(pwas)) return 'No PWAs available';
			return JSON.stringify(
				pwas.map((p: Record<string, unknown>) => ({
					name: p.name,
					id: p.id,
					summary: p.summary,
					url: p.url,
					widevine: p.widevine,
					tray: p.tray
				})),
				null,
				2
			);
		}

		if (toolName === 'get_lutris_whitelist') {
			const res = await fetch('https://forge.blossomos.org/api/lutris-whitelist');
			if (!res.ok) return 'Lutris whitelist unavailable';
			const games = await res.json();
			return JSON.stringify(games.slice(0, 20), null, 2);
		}

		if (toolName === 'get_homebrew_formula') {
			const name = String(toolInput.name || '');
			const [formulaRes, caskRes] = await Promise.all([
				fetch(`https://formulae.brew.sh/api/formula/${encodeURIComponent(name)}.json`),
				fetch(`https://formulae.brew.sh/api/cask/${encodeURIComponent(name)}.json`)
			]);
			const results: Record<string, unknown>[] = [];
			if (formulaRes.ok) {
				const f = await formulaRes.json();
				results.push({ type: 'formula', name: f.name, desc: f.desc, homepage: f.homepage });
			}
			if (caskRes.ok) {
				const c = await caskRes.json();
				results.push({
					type: 'cask',
					token: c.token,
					name: c.name?.[0] ?? c.token,
					desc: c.desc,
					homepage: c.homepage
				});
			}
			return results.length > 0
				? JSON.stringify(results, null, 2)
				: `${name} not found in Homebrew`;
		}

		if (toolName === 'get_anticheat_status') {
			const query = String(toolInput.game || '').toLowerCase();
			const games = await getAnticheatGames();
			const matches = games
				.filter((g) => g.name.toLowerCase().includes(query))
				.slice(0, 5)
				.map((g) => ({
					name: g.name,
					status: g.status,
					native: g.native,
					anticheats: g.anticheats,
					cloudGaming: findCloudGaming(g.notes)
				}));
			return matches.length > 0
				? JSON.stringify(matches, null, 2)
				: `${toolInput.game} not found on Are We Anti-Cheat Yet`;
		}

		if (toolName === 'get_protondb_rating') {
			const appId = String(toolInput.steam_app_id || '');
			const res = await fetch(
				`https://www.protondb.com/api/v1/reports/summaries/${encodeURIComponent(appId)}.json`
			);
			if (!res.ok) return 'No ProtonDB data found for this game';
			const data = await res.json();
			return JSON.stringify(
				{ tier: data.tier, total: data.total, confidence: data.confidence },
				null,
				2
			);
		}

		return 'Unknown tool';
	} catch (e) {
		return `Tool error: ${String(e).slice(0, 100)}`;
	}
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const origin = request.headers.get('origin') ?? '';
	const host = (request.headers.get('host') ?? '').split(':')[0];
	if (!host || !origin.includes(host)) error(403, 'Forbidden');

	const ip = getClientAddress();
	const now = Date.now();
	const entry = rl.get(ip) ?? { n: 0, t: now + 60_000 };
	if (now > entry.t) {
		entry.n = 0;
		entry.t = now + 60_000;
	}
	if (++entry.n > 15) {
		rl.set(ip, entry);
		error(429, 'Too many requests - please wait a moment');
	}
	rl.set(ip, entry);

	let body: { message: string; history?: { role: string; content: string }[] };
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid request body');
	}

	const msg = String(body.message ?? '')
		.trim()
		.slice(0, 800);
	if (!msg) error(400, 'Empty message');

	const history = (body.history ?? []).slice(-10).map((h) => ({
		role: h.role === 'assistant' ? ('assistant' as const) : ('user' as const),
		content: String(h.content).slice(0, 2000)
	}));

	const messages: MessageParam[] = [...history, { role: 'user', content: msg }];

	const { readable, writable } = new TransformStream<Uint8Array>();
	const writer = writable.getWriter();
	const enc = new TextEncoder();

	// Collect web search result URLs across all loop iterations
	const webRefs: { url: string; title: string }[] = [];

	// Streaming agentic loop — single stream() call per iteration, response starts immediately
	async function runLoop(depth = 0): Promise<void> {
		if (depth > 5) return;

		const stream = client.messages.stream({
			model: 'claude-sonnet-4-6',
			max_tokens: 1200,
			system: SYSTEM,
			tools,
			messages
		});

		for await (const rawChunk of stream) {
			const chunk = rawChunk as unknown as Record<string, unknown>;
			if (chunk.type === 'content_block_start') {
				const block = chunk.content_block as Record<string, unknown> | undefined;
				// Emit status marker for both client tools and server tools (web_search)
				if ((block?.type === 'tool_use' || block?.type === 'server_tool_use') && block.name) {
					await writer.write(enc.encode(`\x01${block.name}\x01`));
				}
			} else if (chunk.type === 'content_block_delta') {
				const delta = chunk.delta as Record<string, unknown> | undefined;
				if (delta?.type === 'text_delta' && delta.text) {
					await writer.write(enc.encode(String(delta.text)));
				}
			}
		}

		const finalMsg = await stream.finalMessage();

		// Extract web search result URLs from this iteration
		for (const block of finalMsg.content) {
			const b = block as unknown as Record<string, unknown>;
			if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
				for (const item of b.content as Record<string, unknown>[]) {
					if (item.type === 'web_search_result' && item.url && item.title) {
						const url = String(item.url);
						if (!webRefs.some((r) => r.url === url)) {
							webRefs.push({ url, title: String(item.title) });
						}
					}
				}
			}
		}

		if (finalMsg.stop_reason === 'tool_use') {
			// Only handle client-side tool_use blocks — server tools (web_search) execute transparently
			const clientToolUses = finalMsg.content.filter(
				(b): b is ToolUseBlock => b.type === 'tool_use'
			);

			if (clientToolUses.length === 0) {
				// Only server tools were called; the API handled them — nothing to do
				return;
			}

			const results = await Promise.all(
				clientToolUses.map(async (tu) => ({
					type: 'tool_result' as const,
					tool_use_id: tu.id,
					content: await callTool(tu.name, tu.input as Record<string, unknown>)
				}))
			);

			messages.push({ role: 'assistant', content: finalMsg.content } as MessageParam);
			messages.push({ role: 'user', content: results } as MessageParam);
			await runLoop(depth + 1);
		}
	}

	(async () => {
		try {
			await runLoop();
			// Append web search sources after the response text
			if (webRefs.length > 0) {
				const refs = webRefs
					.slice(0, 5)
					.map((r) => `${r.url}|${r.title}`)
					.join('\n');
				await writer.write(enc.encode(`\n[WEB_REFS]\n${refs}`));
			}
		} catch (e) {
			const errMsg = e instanceof Error ? e.message : String(e);
			try {
				await writer.write(enc.encode(`\nError: ${errMsg.slice(0, 200)}`));
			} catch {
				// client disconnected, nothing left to write to
			}
		} finally {
			try {
				await writer.close();
			} catch {
				// stream already closed, e.g. client disconnected mid-response
			}
		}
	})();

	return new Response(readable, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'X-Content-Type-Options': 'nosniff',
			'Cache-Control': 'no-store'
		}
	});
};
