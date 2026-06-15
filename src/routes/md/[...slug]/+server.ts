import { error, type RequestHandler } from '@sveltejs/kit';

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
	try {
		let slug = params.slug;
		if (!slug) error(400, 'Missing slug parameter');

		if (slug.endsWith('.md')) {
			slug = slug.slice(0, -3);
		}

		const modules = import.meta.glob<string>('/content/en/**/*.svx', {
			query: '?raw',
			import: 'default'
		});

		const flatPath = `/content/en/${slug}.svx`;
		const folderPath = `/content/en/${slug}/+page.svx`;
		const filePath = flatPath in modules ? flatPath : folderPath in modules ? folderPath : null;

		if (!filePath) {
			error(404, 'Not Found');
		}

		const rawContent = await modules[filePath]();

		const cleanMarkdown = rawContent
			.replace(/^---[\s\S]*?---/, '')
			.replace(/<script[\s\S]*?<\/script>/gi, '')
			.replace(/<style[\s\S]*?<\/style>/gi, '')
			.trim();

		return new Response(cleanMarkdown + '\n', {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	} catch (e) {
		console.error(e);
		error(500, 'Error processing markdown');
	}
};

export const entries = async () => {
	const modules = import.meta.glob('/content/en/**/*.svx');
	const paths = Object.keys(modules).map((path) => {
		const slug = path
			.replace('/content/en/', '')
			.replace(/\/\+page\.svx$/, '')
			.replace(/\.svx$/, '');
		return { slug: `${slug}.md` };
	});
	return paths;
};
