<script lang="ts">
	let { label, onclick }: { label: string; onclick: () => void } = $props();
</script>

<button
	{onclick}
	class="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
>
	{label}
</button>
