import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type SteamSearchItem = {
	type: string;
	id: number;
	name: string;
	tiny_image?: string;
};

const NON_GAME_KEYWORDS = [
	'soundtrack',
	'ost',
	'artbook',
	'art book',
	'demo',
	'dedicated server',
	'trailer',
	'wallpaper',
	'digital comic'
];

// storesearch has no server-side way to exclude DLC, soundtracks, etc, it's all
// returned as plain "app" entries. Steam's own DLC/pack naming convention is very
// consistently "<Base Game> - <Addon Name>", so treat a dash-separated title as
// non-game content, plus a keyword denylist for the rest (soundtracks, demos, ...).
function looksLikeGame(title: string) {
	if (title.includes(' - ')) return false;
	const lower = title.toLowerCase();
	return !NON_GAME_KEYWORDS.some((kw) => lower.includes(kw));
}

// Steam's storesearch endpoint doesn't send CORS headers, so this proxies it
// server-side. Covers the full Steam catalog, not just games that already
// have ProtonDB reports, unlike the protondb.max-p.me games list.
export const GET: RequestHandler = async ({ url, fetch }) => {
	const term = url.searchParams.get('q')?.trim();
	if (!term) return json([]);

	const res = await fetch(
		`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=us&l=english`
	);
	if (!res.ok) return json([]);

	const data = (await res.json()) as { items?: SteamSearchItem[] };
	const items = (data.items ?? [])
		.filter((item) => item.type === 'app' && looksLikeGame(item.name))
		.map((item) => ({ appId: item.id, title: item.name, image: item.tiny_image ?? null }))
		.slice(0, 8);

	return json(items, { headers: { 'Cache-Control': 'public, max-age=300' } });
};
