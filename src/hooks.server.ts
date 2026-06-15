import { redirect, type Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { sequence } from '@sveltejs/kit/hooks';

const handleMarkdownRedirect: Handle = ({ event, resolve }) => {
	const { pathname } = event.url;
	if (
		pathname.startsWith('/help/') &&
		event.request.headers.get('accept')?.includes('text/markdown')
	) {
		const slug = pathname.slice('/help/'.length);
		redirect(302, `/md/${slug}.md`);
	}
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = sequence(handleMarkdownRedirect, handleParaglide);
