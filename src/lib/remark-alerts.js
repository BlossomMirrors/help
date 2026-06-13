import { visit } from 'unist-util-visit';

/** Converts > [!NOTE] blockquotes to admonition divs. */
export default function remarkAlerts() {
	return (/** @type {any} */ tree) => {
		visit(tree, 'blockquote', (node) => {
			const first = node.children[0];
			if (first?.type !== 'paragraph') return;
			const firstChild = first.children[0];

			let type;

			// Inside mdsvex, [!WARNING] is parsed as a linkReference node
			if (firstChild?.type === 'linkReference') {
				const id = firstChild.identifier?.toLowerCase();
				const match = id?.match(/^!(note|tip|important|warning|caution)$/);
				if (!match) return;
				type = match[1];
				first.children.shift(); // remove the [!WARNING] linkReference
				// trim leading newline from the next text node
				if (first.children[0]?.type === 'text') {
					first.children[0].value = first.children[0].value.replace(/^\n/, '');
					if (!first.children[0].value) first.children.shift();
				}
				if (first.children.length === 0) node.children.shift();
			} else if (firstChild?.type === 'text') {
				// Fallback: plain text with [!WARNING] prefix
				const match = firstChild.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n?/);
				if (!match) return;
				type = match[1].toLowerCase();
				firstChild.value = firstChild.value.slice(match[0].length);
				if (!firstChild.value.trim() && first.children.length === 1) node.children.shift();
			} else {
				return;
			}

			node.children.unshift({
				type: 'paragraph',
				data: { hName: 'p', hProperties: { class: 'admonition-title', 'data-type': type } },
				children: []
			});

			node.data = {
				hName: 'div',
				hProperties: { class: `admonition admonition-${type}` }
			};
		});
	};
}
