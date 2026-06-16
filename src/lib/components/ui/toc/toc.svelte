<script lang="ts" module>
	export type TocItem = {
		id?: string | null;
		label: string;
		active: boolean;
		children: TocItem[];
	};

	export type TocProps = {
		toc: TocItem[];
		class?: string;
		isChild?: boolean;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';
	import Self from './toc.svelte';

	let { toc, isChild = false, class: className }: TocProps = $props();

	let wrapperEl = $state<HTMLDivElement | null>(null);
	let trackPath = $state('');
	let clipY = $state(0);
	let clipH = $state(0);
	let hasActive = $state(false);

	// Unique clip ID so multiple TOC instances don't collide
	const clipId = `toc-clip-${Math.random().toString(36).slice(2)}`;

	const INDENT = 12;

	function flattenWithDepth(
		headings: TocItem[],
		depth = 0
	): Array<{ heading: TocItem; depth: number }> {
		return headings.flatMap((h) => [
			{ heading: h, depth },
			...flattenWithDepth(h.children, depth + 1)
		]);
	}

	function offsetTopTo(el: HTMLElement, container: HTMLElement): number {
		let top = 0;
		let cur: HTMLElement | null = el;
		while (cur && cur !== container) {
			top += cur.offsetTop;
			cur = cur.offsetParent as HTMLElement | null;
		}
		return top;
	}

	function buildPath(segs: { x: number; yTop: number; yBot: number }[]): string {
		if (segs.length === 0) return '';
		let d = `M ${segs[0].x} ${segs[0].yTop}`;
		for (let i = 0; i < segs.length; i++) {
			const curr = segs[i];
			const next = segs[i + 1];
			if (!next) {
				d += ` L ${curr.x} ${curr.yBot}`;
			} else {
				d += ` L ${curr.x} ${curr.yBot}`;
				const midY = (curr.yBot + next.yTop) / 2;
				d += ` C ${curr.x} ${midY} ${next.x} ${midY} ${next.x} ${next.yTop}`;
			}
		}
		return d;
	}

	function buildSegs(
		items: Array<{ heading: TocItem; depth: number }>
	): { x: number; yTop: number; yBot: number }[] {
		if (!wrapperEl) return [];
		const segs: { x: number; yTop: number; yBot: number }[] = [];
		for (const { heading, depth } of items) {
			if (!heading.id) continue;
			const link = wrapperEl.querySelector<HTMLElement>(`a[href="#${heading.id}"]`);
			if (!link) continue;
			const yTop = offsetTopTo(link, wrapperEl);
			const yBot = yTop + link.offsetHeight;
			const x = depth * INDENT;
			const last = segs[segs.length - 1];
			if (last && last.x === x) {
				last.yBot = yBot;
			} else {
				segs.push({ x, yTop, yBot });
			}
		}
		return segs;
	}

	$effect(() => {
		if (isChild || !wrapperEl) return;

		const all = flattenWithDepth(toc);

		// Track: always the full structure
		trackPath = buildPath(buildSegs(all.filter(({ heading: h }) => !!h.id)));

		// Clip: span from top of first active link to bottom of last active link
		const active = all.filter(({ heading: h }) => h.active && h.id);
		if (active.length === 0) {
			hasActive = false;
			return;
		}

		const first = wrapperEl.querySelector<HTMLElement>(`a[href="#${active[0].heading.id}"]`);
		const last = wrapperEl.querySelector<HTMLElement>(
			`a[href="#${active[active.length - 1].heading.id}"]`
		);
		if (!first || !last) {
			hasActive = false;
			return;
		}

		const yTop = offsetTopTo(first, wrapperEl);
		const yBot = offsetTopTo(last, wrapperEl) + last.offsetHeight;
		clipY = yTop;
		clipH = yBot - yTop;
		hasActive = true;
	});
</script>

{#if !isChild}
	<div bind:this={wrapperEl} class={cn('relative', className)}>
		<svg
			class="pointer-events-none absolute left-0 top-0"
			width="100%"
			height="100%"
			style="overflow: visible;"
			aria-hidden="true"
		>
			<defs>
				<clipPath id={clipId}>
					<!--
						Rect covers the full horizontal extent (x=-20 .. 200) so it captures
						S-curves that bend sideways. Only y/height animate - plain numbers,
						always smooth regardless of path shape changes.
					-->
					<rect
						x="-20"
						width="200"
						style="y: {clipY}px; height: {clipH}px; transition: y 200ms ease-out, height 200ms ease-out;"
					/>
				</clipPath>
			</defs>

			<!-- Grey track: full TOC shape -->
			<path
				d={trackPath || 'M 0 0'}
				stroke="var(--color-border)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
			/>

			<!-- Primary indicator: same path, clipped to active y-range -->
			<path
				d={trackPath || 'M 0 0'}
				stroke="var(--color-primary)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
				clip-path="url(#{clipId})"
				style="opacity: {hasActive ? 1 : 0}; transition: opacity 150ms ease-out;"
			/>
		</svg>

		<ul class="m-0 list-none pl-3 text-sm">
			{#each toc as heading, i (i)}
				<li class="mt-0 pt-1.5">
					{#if heading.id}
						<a
							href="#{heading.id}"
							class={cn(
								'block transition-colors hover:text-foreground',
								heading.active ? 'font-medium text-foreground' : 'text-muted-foreground'
							)}>{heading.label}</a
						>
					{:else}
						<span class="block">{heading.label}</span>
					{/if}
					{#if heading.children.length > 0}
						<Self toc={heading.children} isChild={true} />
					{/if}
				</li>
			{/each}
		</ul>
	</div>
{:else}
	<ul class="m-0 list-none pl-3 text-sm">
		{#each toc as heading, i (i)}
			<li class="mt-0 pt-1.5">
				{#if heading.id}
					<a
						href="#{heading.id}"
						class={cn(
							'block transition-colors hover:text-foreground',
							heading.active ? 'font-medium text-foreground' : 'text-muted-foreground'
						)}>{heading.label}</a
					>
				{:else}
					<span class="block">{heading.label}</span>
				{/if}
				{#if heading.children.length > 0}
					<Self toc={heading.children} isChild={true} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
