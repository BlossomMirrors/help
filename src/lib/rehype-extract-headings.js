import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';

/** Rehype plugin - must run after rehype-slug so IDs are already set. */
export function rehypeExtractHeadings() {
	return (tree, file) => {
		const headings = [];
		visit(tree, 'element', (node) => {
			if (/^h[1-6]$/.test(node.tagName)) {
				headings.push({
					level: parseInt(node.tagName[1]),
					id: node.properties?.id ?? null,
					label: toString(node)
				});
			}
		});
		file.data.fm = { ...(file.data.fm ?? {}), headings };
	};
}
