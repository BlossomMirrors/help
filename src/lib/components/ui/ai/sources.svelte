<script lang="ts">
	import FileTextIcon from '@lucide/svelte/icons/file-text';

	export type Source = { url: string; title: string; description?: string };

	let { sources }: { sources: Source[] } = $props();
</script>

{#if sources.length > 0}
	<div class="ml-8 mt-3 flex flex-wrap gap-2">
		{#each sources as s (s.url)}
			<a
				href={s.url}
				class="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
				title={s.description}
			>
				<FileTextIcon size={11} class="shrink-0" />
				{s.title}
			</a>
		{/each}
	</div>
{/if}
