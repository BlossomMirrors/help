import { getLocale } from '$lib/paraglide/runtime';
import { error, redirect } from '@sveltejs/kit';
import { getNav, flattenNav } from '$lib/nav';
import type { Component } from 'svelte';

const pages = import.meta.glob<{ default: Component; metadata?: Record<string, unknown> }>(
	'/content/**\/+page.svx'
);

export async function load({ params }) {
	const locale = getLocale();
	const [docset, ...rest] = params.slug.split('/');
	const path = rest.join('/');

	const localePath = path
		? `/content/${locale}/${docset}/${path}/+page.svx`
		: `/content/${locale}/${docset}/+page.svx`;
	const fallbackPath = path
		? `/content/en/${docset}/${path}/+page.svx`
		: `/content/en/${docset}/+page.svx`;

	const loader = pages[localePath] ?? pages[fallbackPath];

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
