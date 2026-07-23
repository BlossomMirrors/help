<script lang="ts">
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import GlobeIcon from '@lucide/svelte/icons/globe';

	export type Source = { url: string; title: string; description?: string };

	let { sources }: { sources: Source[] } = $props();

	function isExternal(url: string) {
		return url.startsWith('http://') || url.startsWith('https://');
	}
</script>

{#if sources.length > 0}
	<div class="mt-3 ml-8 flex flex-wrap gap-2">
		{#each sources as s (s.url)}
			<a
				href={s.url}
				class="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
				title={s.description ?? s.url}
				target={isExternal(s.url) ? '_blank' : undefined}
				rel={isExternal(s.url) ? 'noopener noreferrer' : undefined}
			>
				{#if isExternal(s.url)}
					<GlobeIcon size={11} class="shrink-0" />
				{:else}
					<FileTextIcon size={11} class="shrink-0" />
				{/if}
				{s.title}
			</a>
		{/each}
	</div>
{/if}
