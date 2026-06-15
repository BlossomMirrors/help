<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	let {
		children,
		class: cls = '',
		glowColor = 'rgba(62,120,255,0.12)'
	}: {
		children: Snippet;
		class?: string;
		glowColor?: string;
	} = $props();

	let el = $state<HTMLDivElement | null>(null);
	let mx = $state(50);
	let my = $state(50);
	let hovered = $state(false);

	function handleMouseMove(e: MouseEvent) {
		if (!el) return;
		const rect = el.getBoundingClientRect();
		mx = ((e.clientX - rect.left) / rect.width) * 100;
		my = ((e.clientY - rect.top) / rect.height) * 100;
	}
</script>

<div
	bind:this={el}
	role="presentation"
	onmousemove={handleMouseMove}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	class={cn('relative overflow-hidden', cls)}
	style="--mx: {mx}%; --my: {my}%; --glow: {glowColor};"
>
	<div
		class="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
		style="opacity: {hovered
			? 1
			: 0}; background: radial-gradient(circle at var(--mx) var(--my), var(--glow) 0%, transparent 65%);"
	></div>
	{@render children()}
</div>
