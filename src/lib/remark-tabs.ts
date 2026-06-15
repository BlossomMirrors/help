/**
 * Remark plugin for markdown tabs.
 *
 * Outer container uses MORE colons than inner tabs (outer nesting rule):
 *   ::::tabs
 *   :::tab[macOS]
 *   content
 *   :::
 *   :::tab[Windows]
 *   content
 *   :::
 *   ::::
 */
import { visit } from 'unist-util-visit';
import { toHast } from 'mdast-util-to-hast';
import { toHtml } from 'hast-util-to-html';

let counter = 0;

export function remarkTabs() {
	return (tree: any) => {
		visit(tree, 'containerDirective', (node: any, index, parent) => {
			if (node.name !== 'tabs' || index == null || !parent) return;

			const id = `md-tabs-${++counter}`;

			const tabs = node.children.filter(
				(child: any) => child.type === 'containerDirective' && child.name === 'tab'
			);

			if (tabs.length === 0) return;

			const buttons = tabs
				.map((tab: any, i: number) => {
					const label =
						tab.children
							.find((c: any) => c?.data?.directiveLabel)
							?.children?.map((c: any) => c.value ?? '')
							.join('') ?? `Tab ${i + 1}`;
					return `<button class="md-tab-btn" role="tab" data-tab="${i}" aria-selected="${i === 0}" aria-controls="${id}-panel-${i}">${label}</button>`;
				})
				.join('');

			const panels = tabs
				.map((tab: any, i: number) => {
					const bodyChildren = tab.children.filter((c: any) => !c?.data?.directiveLabel);
					const bodyHast = {
						type: 'root' as const,
						children: bodyChildren.map((c: any) => toHast(c))
					};
					const bodyHtml = toHtml(bodyHast);
					return `<div class="md-tab-panel" role="tabpanel" id="${id}-panel-${i}" data-panel="${i}"${i > 0 ? ' hidden' : ''}>${bodyHtml}</div>`;
				})
				.join('');

			parent.children[index] = {
				type: 'html',
				value: `<div class="md-tabs" data-tabs="${id}">\n<div class="md-tabs-list" role="tablist">${buttons}</div>\n${panels}\n</div>`
			};
		});
	};
}
