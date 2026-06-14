<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';
	import * as m from '$lib/paraglide/messages';
	import { flattenNav, type NavNode } from '$lib/nav';

	type Props = {
		sidebarOpen: boolean;
		nav: NavNode[];
		currentDocsetId: string;
		currentDocset: { title: string };
		currentPath: string;
		onToggleSidebar: () => void;
	};

	let { sidebarOpen, nav, currentDocsetId, currentDocset, currentPath, onToggleSidebar }: Props =
		$props();

	const breadcrumbs = $derived.by(() => {
		const flat = flattenNav(nav);
		const firstDocsetPage = flat[0]?.href ?? `/help/${currentDocsetId}`;
		const segments = currentPath
			.replace(/^\/help\/[^/]+\/?/, '')
			.split('/')
			.filter(Boolean);
		const crumbs: { label: string; href: string }[] = [
			{ label: currentDocset.title, href: firstDocsetPage }
		];
		let href = `/help/${currentDocsetId}`;
		for (const seg of segments) {
			href += '/' + seg;
			const node = flat.find((n) => n.href === href);
			crumbs.push({ label: node?.title ?? seg, href });
		}
		return crumbs;
	});
</script>

<header
	class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-sm"
>
	<button
		onclick={onToggleSidebar}
		class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
		aria-label={m.aria_toggle_sidebar()}
	>
		{#if sidebarOpen}<XIcon size={18} strokeWidth={1.5} />{:else}<MenuIcon
				size={18}
				strokeWidth={1.5}
			/>{/if}
	</button>

	<Breadcrumb.Root class="min-w-0 flex-1">
		<Breadcrumb.List>
			{#each breadcrumbs as crumb, i (crumb.href)}
				<Breadcrumb.Item>
					{#if i < breadcrumbs.length - 1}
						<Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
					{:else}
						<Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
					{/if}
				</Breadcrumb.Item>
				{#if i < breadcrumbs.length - 1}<Breadcrumb.Separator />{/if}
			{/each}
		</Breadcrumb.List>
	</Breadcrumb.Root>
</header>
