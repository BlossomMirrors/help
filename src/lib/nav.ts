import { getLocale } from '$lib/paraglide/runtime';

export type NavTag = 'new' | 'beta' | 'deprecated';

export type NavNode = {
	slug: string;
	title: string;
	href?: string;
	tag?: NavTag;
	icon?: string;
	order: number;
	children: NavNode[];
};

type ContentMeta = {
	title?: string;
	order?: number;
	tag?: NavTag;
	icon?: string;
};

// Only scan +page.svx files - slug comes from the containing folder
const allModules = import.meta.glob<{ metadata?: ContentMeta }>('/content/**\/+page.svx', {
	eager: true
});

function titleCase(s: string) {
	return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildTree(entries: { rel: string; meta: ContentMeta }[], docset: string): NavNode[] {
	const root: NavNode[] = [];

	for (const { rel, meta } of entries) {
		// rel is like '+page.svx', 'getting-started/+page.svx', 'features/shortcuts/+page.svx'
		const folderPath = rel === '+page.svx' ? '' : rel.slice(0, -'/+page.svx'.length);

		if (!folderPath) {
			// Docset root landing page
			root.unshift({
				slug: '+page',
				title: meta.title ?? titleCase(docset),
				href: `/help/${docset}`,
				icon: meta.icon,
				order: meta.order ?? 0,
				children: []
			});
			continue;
		}

		const parts = folderPath.split('/');
		let level = root;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const isLeaf = i === parts.length - 1;
			const existing = level.find((n) => n.slug === part);

			if (isLeaf) {
				const href = `/help/${docset}/${folderPath}`;
				if (existing) {
					// Folder already created as a group node - attach href and metadata to it
					existing.href = href;
					if (meta.title) existing.title = meta.title;
					if (meta.icon) existing.icon = meta.icon;
					if (meta.tag) existing.tag = meta.tag;
					if (meta.order !== undefined) existing.order = meta.order;
				} else {
					level.push({
						slug: part,
						title: meta.title ?? titleCase(part),
						href,
						tag: meta.tag,
						icon: meta.icon,
						order: meta.order ?? 999,
						children: []
					});
				}
			} else {
				if (!existing) {
					const group: NavNode = { slug: part, title: titleCase(part), order: 500, children: [] };
					level.push(group);
					level = group.children;
				} else {
					level = existing.children;
				}
			}
		}
	}

	const sort = (nodes: NavNode[]) => {
		nodes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
		nodes.forEach((n) => sort(n.children));
	};
	sort(root);

	return root;
}

export function getNav(docset: string): NavNode[] {
	const locale = getLocale();
	const prefix = `/content/${locale}/${docset}/`;

	const entries = Object.entries(allModules)
		.filter(([p]) => p.startsWith(prefix))
		.map(([p, mod]) => ({
			rel: p.slice(prefix.length),
			meta: (mod.metadata ?? {}) as ContentMeta
		}));

	return buildTree(entries, docset);
}

export function flattenNav(nodes: NavNode[]): NavNode[] {
	return nodes.flatMap((n) => [...(n.href ? [n] : []), ...flattenNav(n.children)]);
}
