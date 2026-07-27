import { getLocale } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import { getDocsetMeta } from '$lib/docsets';
import { renderIcon } from '$lib/server/og-icons';
import { error, redirect } from '@sveltejs/kit';
import type { Component } from 'svelte';
import type { RequestHandler } from './$types';

const pages = import.meta.glob<{ default: Component; metadata?: Record<string, unknown> }>(
	'/content/**/*.svx'
);

let fontsPromise: Promise<
	{ name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' | 'italic' }[]
> | null = null;

// Cloudflare Workers reject a Worker fetching its own zone over the public network
// (error 1042), so static assets must be read via the ASSETS binding instead of a
// plain same-origin fetch().
type AssetFetch = (path: string) => Promise<Response>;

function loadFonts(assetFetch: AssetFetch) {
	if (!fontsPromise) {
		fontsPromise = Promise.all([
			assetFetch('/fonts-og/Aspekta-400.ttf').then((r) => r.arrayBuffer()),
			assetFetch('/fonts-og/Aspekta-700.ttf').then((r) => r.arrayBuffer()),
			assetFetch('/fonts-og/Lora-Italic.ttf').then((r) => r.arrayBuffer())
		]).then(([aspekta400, aspekta700, loraItalic]) => [
			{
				name: 'Aspekta',
				data: aspekta400,
				weight: 400 as const,
				style: 'normal' as const
			},
			{
				name: 'Aspekta',
				data: aspekta700,
				weight: 700 as const,
				style: 'normal' as const
			},
			{
				name: 'Lora',
				data: loraItalic,
				weight: 400 as const,
				style: 'italic' as const
			}
		]);
	}
	return fontsPromise;
}

async function toDataUri(assetFetch: AssetFetch, url: string) {
	const res = await assetFetch(url);
	const buf = Buffer.from(await res.arrayBuffer());
	const contentType = res.headers.get('content-type') ?? 'image/jpeg';
	return `data:${contentType};base64,${buf.toString('base64')}`;
}

export const GET: RequestHandler = async ({ params, request, platform }) => {
	const assetFetch: AssetFetch = (path) => platform!.env.ASSETS.fetch(new URL(path, request.url));

	const locale = getLocale();
	const [docset, ...rest] = params.slug.split('/');
	const path = rest.join('/');

	const loader = path
		? (pages[`/content/${locale}/${docset}/${path}.svx`] ??
			pages[`/content/${locale}/${docset}/${path}/+page.svx`] ??
			pages[`/content/en/${docset}/${path}.svx`] ??
			pages[`/content/en/${docset}/${path}/+page.svx`])
		: (pages[`/content/${locale}/${docset}/+page.svx`] ?? pages[`/content/en/${docset}/+page.svx`]);

	if (!loader) error(404, `No content found for ${docset}/${path}`);

	const mod = await loader();
	const metadata = mod.metadata ?? {};
	const title = typeof metadata.title === 'string' ? metadata.title : m.help_title();
	const description = typeof metadata.description === 'string' ? metadata.description : null;
	const image = typeof metadata.image === 'string' ? metadata.image : null;
	const isVideo = image ? /\.(mp4|webm|mov)$/i.test(image) : false;

	// No usable cover image, fall back to the static default card instead of generating one
	if (!image || isVideo) redirect(302, '/og-image.png');

	const iconName = typeof metadata.icon === 'string' ? metadata.icon : getDocsetMeta(docset).icon;

	const [fonts, imageDataUri] = await Promise.all([
		loadFonts(assetFetch),
		toDataUri(assetFetch, image)
	]);

	const { renderOgPng } = await import('$lib/server/og-render');
	const png = await renderOgPng(
		{
			type: 'div',
			props: {
				style: {
					display: 'flex',
					flexDirection: 'column',
					width: '1200px',
					height: '630px',
					background: '#0c0c12',
					fontFamily: 'Aspekta'
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								position: 'relative',
								display: 'flex',
								width: '1200px',
								height: '360px',
								overflow: 'hidden'
							},
							children: [
								{
									type: 'img',
									props: {
										src: imageDataUri,
										style: {
											position: 'absolute',
											top: 0,
											left: 0,
											width: '1200px',
											height: '360px',
											objectFit: 'cover'
										}
									}
								},
								{
									type: 'div',
									props: {
										style: {
											position: 'absolute',
											bottom: 0,
											left: 0,
											width: '1200px',
											height: '140px',
											background: 'linear-gradient(to top, #0c0c12, rgba(12,12,18,0))'
										}
									}
								},
								{
									type: 'div',
									props: {
										style: {
											position: 'absolute',
											top: 48,
											left: 48,
											display: 'flex',
											width: 64,
											height: 64,
											borderRadius: 16,
											background: 'rgba(255,255,255,0.16)',
											border: '1px solid rgba(255,255,255,0.25)',
											alignItems: 'center',
											justifyContent: 'center'
										},
										children: iconName ? [renderIcon(iconName, '#ffffff', 30)] : []
									}
								}
							]
						}
					},
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								flexDirection: 'column',
								flex: 1,
								padding: '32px 64px 48px'
							},
							children: [
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											color: '#3e78ff',
											fontSize: 20,
											fontWeight: 700,
											letterSpacing: 2,
											textTransform: 'uppercase',
											marginBottom: 16
										},
										children: m.help_title()
									}
								},
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											fontFamily: 'Lora',
											fontStyle: 'italic',
											fontSize: 52,
											lineHeight: 1.15,
											color: '#ededf0'
										},
										children: title
									}
								},
								...(description
									? [
											{
												type: 'div',
												props: {
													style: {
														display: '-webkit-box',
														WebkitBoxOrient: 'vertical',
														WebkitLineClamp: 2,
														overflow: 'hidden',
														marginTop: 14,
														fontSize: 24,
														lineHeight: 1.35,
														color: '#9a9aa8'
													},
													children: description
												}
											}
										]
									: [])
							]
						}
					}
				]
			}
		},
		{ width: 1200, height: 630, fonts }
	);

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
