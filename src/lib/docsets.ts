import { getLocale } from '$lib/paraglide/runtime';

export type DocsetMeta = {
	id: string;
	title: string;
	description?: string;
	icon?: string;
	order?: number;
};

const allDocsetFiles = import.meta.glob<{ default: Omit<DocsetMeta, 'id'> }>(
	'/content/**\/+docset.ts',
	{ eager: true }
);

// Derive available docset IDs from the canonical (en) locale
export function getDocsetIds(): string[] {
	return Object.keys(allDocsetFiles)
		.filter((p) => p.startsWith('/content/en/') && p.endsWith('/+docset.ts'))
		.map((p) => p.slice('/content/en/'.length, -'/+docset.ts'.length))
		.filter((id) => !id.includes('/'))
		.sort((a, b) => {
			const orderA = allDocsetFiles[`/content/en/${a}/+docset.ts`]?.default?.order ?? 999;
			const orderB = allDocsetFiles[`/content/en/${b}/+docset.ts`]?.default?.order ?? 999;
			return orderA - orderB;
		});
}

export function getDocsetMeta(id: string): DocsetMeta {
	const locale = getLocale();
	const localePath = `/content/${locale}/${id}/+docset.ts`;
	const fallbackPath = `/content/en/${id}/+docset.ts`;
	const data = allDocsetFiles[localePath]?.default ?? allDocsetFiles[fallbackPath]?.default;
	return {
		id,
		title: data?.title ?? id,
		description: data?.description,
		icon: data?.icon,
		order: data?.order
	};
}
