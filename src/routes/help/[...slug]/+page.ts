import { getLocale } from '$lib/paraglide/runtime';
import { error, redirect } from '@sveltejs/kit';
import { getNav, flattenNav } from '$lib/nav';
import type { Component } from 'svelte';

const pages = import.meta.glob<{ default: Component; metadata?: Record<string, unknown> }>(
	'/content/**\/*.svx'
);

export async function load({ params }) {
	const locale = getLocale();
	const [docset, ...rest] = params.slug.split('/');
	const path = rest.join('/');

	const loader = path
		? (pages[`/content/${locale}/${docset}/${path}.svx`] ??
			pages[`/content/${locale}/${docset}/${path}/+page.svx`] ??
			pages[`/content/en/${docset}/${path}.svx`] ??
			pages[`/content/en/${docset}/${path}/+page.svx`])
		: (pages[`/content/${locale}/${docset}/+page.svx`] ??
			pages[`/content/en/${docset}/+page.svx`]);

	if (!loader) {
		if (!path) {
			const first = flattenNav(getNav(docset))[0];
			redirect(302, first?.href ?? '/help');
		}
		error(404, `No content found for ${docset}/${path}`);
	}

	const mod = await loader();
	return { Content: mod.default, metadata: mod.metadata ?? {}, docset };
}
