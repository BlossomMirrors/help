<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { BadgeCheck, ExternalLink } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let { id } = $props();

	type AppData = {
		name: string;
		summary: string;
		developer_name: string;
		verified: boolean;
		license: string;
		content_rating: string;
		homepage_url?: string;
	};

	let app = $state<AppData | undefined>(undefined);
	let icon = $state('');

	onMount(() => {
		fetch(`https://arpi.blossomos.org/api/v1/apps/${id}?lang=${getLocale()}`)
			.then((res) => res.json())
			.then((data: AppData) => {
				app = data;
			});
		icon = `https://arpi.blossomos.org/api/v1/apps/${id}/icon`;
		fetch(icon)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to fetch icon');
				icon = res.url;
			})
			.catch(() => {
				icon = '/default.svg';
			});
	});
</script>

<div class="my-4">
	<div class="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-sm">
		<div class="flex items-start gap-3 p-4">
			<img
				src={icon}
				alt={app?.name ?? id}
				class="h-14 w-14 shrink-0 rounded-xl border border-border bg-muted object-cover"
			/>
			<div class="min-w-0 flex-1">
				<span class="truncate text-base font-semibold text-foreground">{app?.name ?? id}</span>
				{#if app?.developer_name}
					<div class="flex items-center gap-1">
						<span class="truncate text-xs text-muted-foreground">{app.developer_name}</span>
						{#if app?.verified}
							<BadgeCheck class="h-3.5 w-3.5 shrink-0 text-blue-500" />
						{/if}
					</div>
				{/if}
				{#if app?.summary}
					<p class="mt-1 line-clamp-2 text-sm text-foreground/80">{app.summary}</p>
				{/if}
			</div>
		</div>

		{#if app}
			<div class="flex flex-wrap items-center gap-2 px-4 pb-3">
				{#if app.license}
					<Badge variant={app.license.includes('Proprietary') ? 'destructive' : 'secondary'}>
						{app.license.includes('Proprietary') ? m.proprietary() : app.license}
					</Badge>
				{/if}
				{#if app.content_rating}
					<Badge variant={app.content_rating.includes('18') ? 'destructive' : 'secondary'}>
						{app.content_rating}
					</Badge>
				{/if}
				{#if app.homepage_url}
					<a
						href={app.homepage_url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-0.5 text-xs text-muted-foreground underline-offset-2 hover:underline"
					>
						{new URL(app.homepage_url).hostname}
						<ExternalLink class="h-3 w-3" />
					</a>
				{/if}
			</div>
		{/if}

		<div class="border-t border-border px-4 py-3">
			<Button
				onclick={() => window.open(`appstream://${id}`)}
				aria-label={app ? m.open_in_arc_aria({ name: app.name }) : m.open_in_arc()}
				class="w-full"
			>
				<img src="/arc.png" alt="Arc Software" class="h-4 w-4" />
				{m.open_in_arc()}
			</Button>
		</div>
	</div>
</div>
