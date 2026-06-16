import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';

/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('vfile').VFile} VFile
 */

/** Rehype plugin - must run after rehype-slug so IDs are already set. */
export function rehypeExtractHeadings() {
	/**
	 * @param {Root} tree
	 * @param {VFile} file
	 */
	return (tree, file) => {
		/** @type {{ level: number, id: string | null, label: string }[]} */
		const headings = [];
		visit(tree, 'element', (node) => {
			if (/^h[1-6]$/.test(node.tagName)) {
				headings.push({
					level: parseInt(node.tagName[1]),
					id: typeof node.properties?.id === 'string' ? node.properties.id : null,
					label: toString(node)
				});
			}
		});
		file.data.fm = { ...(file.data.fm ?? {}), headings };
	};
}
