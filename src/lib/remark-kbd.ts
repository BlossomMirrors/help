/**
 * Remark plugin for inline keyboard key rendering:
 *   :kbd[⌘ K]  →  <kbd class="md-kbd">⌘ K</kbd>
 *
 * Uses remark-directive's textDirective (single colon, inline).
 */
import { visit } from 'unist-util-visit';

export function remarkKbd() {
	return (tree: any) => {
		visit(tree, 'textDirective', (node: any, index, parent) => {
			if (node.name !== 'kbd' || index == null || !parent) return;

			const label = node.children
				?.filter((c: any) => c.type === 'text')
				.map((c: any) => c.value)
				.join('');

			parent.children[index] = {
				type: 'html',
				value: `<kbd class="md-kbd">${label}</kbd>`
			};
		});
	};
}
