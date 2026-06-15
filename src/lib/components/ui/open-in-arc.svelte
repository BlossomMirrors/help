<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import ExternalLinkIcon from 'lucide-svelte/icons/external-link';

	let {
		id,
		type = 'flatpak',
		name = ''
	}: {
		id: string;
		type?: 'pwa' | 'lutris' | 'flatpak';
		name?: string;
	} = $props();

	const href = $derived(
		type === 'pwa'
			? `appstream://pwa:${id}`
			: type === 'lutris'
				? `appstream://lutris:${id}`
				: `appstream://${id}`
	);
</script>

<a
	{href}
	aria-label={m.open_in_arc_aria({ name: name || id })}
	class="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-primary/50 bg-button-accent/25 px-3 py-1.5 text-sm font-medium text-button-foreground transition-colors duration-100 hover:border-primary/80 hover:bg-button-accent-hover/35 active:translate-y-[0.5px]"
>
	<ExternalLinkIcon size={14} />
	{m.open_in_arc()}
</a>
