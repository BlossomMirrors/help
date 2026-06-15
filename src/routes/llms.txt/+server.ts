import { error, type RequestHandler } from '@sveltejs/kit';

export const prerender = true;

interface MdsvexMetadata {
	title?: string;
	description?: string;
	draft?: boolean;
}

interface MdsvexModule {
	metadata: MdsvexMetadata;
}

interface DocsetConfig {
	title: string;
	description?: string;
	icon?: string;
	order?: number;
}

interface DocsetModule {
	default: DocsetConfig;
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const pageModules = import.meta.glob<MdsvexModule>('/content/en/**/*.svx', { eager: false });
		const docsetModules = import.meta.glob<DocsetModule>('/content/en/**/+docset.ts');

		const docsetsByFolder: Record<string, DocsetConfig> = {};

		for (const path in docsetModules) {
			const mod = await docsetModules[path]();
			const folder = path.replace('/content/en/', '').replace('/+docset.ts', '');

			if (mod.default) {
				docsetsByFolder[folder] = mod.default;
			}
		}

		const pagesByDocset: Record<
			string,
			Array<{ title: string; description?: string; url: string }>
		> = {};

		for (const path in pageModules) {
			const mod = await pageModules[path]();

			if (mod.metadata && !mod.metadata.draft) {
				const cleanRoute = path
					.replace('/content/en/', '')
					.replace(/\/\+page\.svx$/, '')
					.replace(/\.svx$/, '');

				const matchedDocsetFolder = Object.keys(docsetsByFolder)
					.sort((a, b) => b.length - a.length)
					.find((folder) => cleanRoute === folder || cleanRoute.startsWith(folder + '/'));

				const docsetKey = matchedDocsetFolder || 'other';

				if (!pagesByDocset[docsetKey]) {
					pagesByDocset[docsetKey] = [];
				}

				pagesByDocset[docsetKey].push({
					title: mod.metadata.title || 'Blossom Help',
					description: mod.metadata.description,
					url: `${url.origin}/md/${cleanRoute}.md`
				});
			}
		}

		let markdown = `# Blossom Help\n\n`;

		const sortedDocsetFolders = Object.keys(docsetsByFolder).sort((a, b) => {
			const orderA = docsetsByFolder[a].order ?? 99;
			const orderB = docsetsByFolder[b].order ?? 99;
			return orderA - orderB;
		});

		sortedDocsetFolders.forEach((folder) => {
			const config = docsetsByFolder[folder];
			const pages = pagesByDocset[folder] || [];

			if (pages.length > 0) {
				markdown += `## ${config.title}\n`;
				if (config.description) {
					markdown += `> ${config.description}\n`;
				}
				markdown += `\n`;

				pages.forEach((page) => {
					markdown += `- [${page.title}](${page.url})${page.description ? `: ${page.description}` : ''}\n`;
				});
				markdown += `\n`;
			}
		});

		if (pagesByDocset['other'] && pagesByDocset['other'].length > 0) {
			markdown += `## General Documentation\n\n`;
			pagesByDocset['other'].forEach((page) => {
				markdown += `- [${page.title}](${page.url})${page.description ? `: ${page.description}` : ''}\n`;
			});
			markdown += `\n`;
		}

		return new Response(markdown.trim() + '\n', {
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8'
			}
		});
	} catch (e) {
		console.error(e);
		error(500, 'Error generating llms.txt');
	}
};
