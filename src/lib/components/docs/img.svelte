<script lang="ts">
	import { cn } from '$lib/utils';
	import { Dialog } from 'bits-ui';
	import { Dialog as DialogRoot, DialogTrigger } from '../ui/dialog';
	import DialogPortal from '../ui/dialog/dialog-portal.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import ZoomInIcon from '@lucide/svelte/icons/zoom-in';
	import ZoomOutIcon from '@lucide/svelte/icons/zoom-out';
	import XIcon from '@lucide/svelte/icons/x';

	let { src, alt, class: className } = $props();

	const MIN_ZOOM = 1;
	const MAX_ZOOM = 4;
	const ZOOM_STEP = 0.5;

	let open = $state(false);
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let gesturing = $state(false);
	let stageEl = $state<HTMLDivElement | null>(null);
	let imgEl = $state<HTMLImageElement | null>(null);

	const pointers = new SvelteMap<number, { x: number; y: number }>();
	let gestureStartZoom = 1;
	let gestureStartPan = { x: 0, y: 0 };
	let gestureStartDist = 0;
	let gestureStartMid = { x: 0, y: 0 };
	let wheelTimeout: ReturnType<typeof setTimeout> | undefined;

	function resetZoom() {
		zoom = 1;
		panX = 0;
		panY = 0;
		pointers.clear();
		gesturing = false;
		clearTimeout(wheelTimeout);
	}

	$effect(() => {
		if (!open) resetZoom();
	});

	// Clamps panning so the (possibly letterboxed) image can't be dragged past its own edges
	function clampPan(x: number, y: number, atZoom: number) {
		if (!stageEl || !imgEl) return { x: 0, y: 0 };
		const naturalW = imgEl.naturalWidth || 1;
		const naturalH = imgEl.naturalHeight || 1;
		const stageW = stageEl.clientWidth;
		const stageH = stageEl.clientHeight;
		const widthConstrained = naturalW / naturalH > stageW / stageH;
		const contentW = widthConstrained ? stageW : (stageH * naturalW) / naturalH;
		const contentH = widthConstrained ? (stageW * naturalH) / naturalW : stageH;
		const maxX = Math.max(0, (contentW * atZoom - stageW) / 2);
		const maxY = Math.max(0, (contentH * atZoom - stageH) / 2);
		return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
	}

	function zoomTo(next: number) {
		zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
		({ x: panX, y: panY } = clampPan(panX, panY, zoom));
	}

	function zoomIn() {
		zoomTo(zoom + ZOOM_STEP);
	}

	function zoomOut() {
		zoomTo(zoom - ZOOM_STEP);
	}

	function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
		return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
	}

	function pointerDist(a: { x: number; y: number }, b: { x: number; y: number }) {
		return Math.hypot(a.x - b.x, a.y - b.y);
	}

	// Zooms around the cursor position so the point under it stays put, like Discord's lightbox
	function onWheel(e: WheelEvent) {
		if (!stageEl) return;
		e.preventDefault();

		gesturing = true;
		clearTimeout(wheelTimeout);
		wheelTimeout = setTimeout(() => (gesturing = false), 150);

		const rect = stageEl.getBoundingClientRect();
		const cx = e.clientX - rect.left - rect.width / 2;
		const cy = e.clientY - rect.top - rect.height / 2;
		const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * Math.exp(-e.deltaY * 0.001)));
		const pointX = (cx - panX) / zoom;
		const pointY = (cy - panY) / zoom;

		zoom = newZoom;
		({ x: panX, y: panY } = clampPan(cx - pointX * newZoom, cy - pointY * newZoom, zoom));
	}

	// Re-baselines the active gesture so switching between one and two fingers doesn't jump
	function beginGesture() {
		gestureStartZoom = zoom;
		gestureStartPan = { x: panX, y: panY };
		const pts = [...pointers.values()];
		if (pts.length === 2) {
			gestureStartDist = pointerDist(pts[0], pts[1]);
			gestureStartMid = midpoint(pts[0], pts[1]);
		} else if (pts.length === 1) {
			gestureStartMid = pts[0];
		}
	}

	function onStagePointerDown(e: PointerEvent) {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		gesturing = true;
		beginGesture();
	}

	function onStagePointerMove(e: PointerEvent) {
		if (!pointers.has(e.pointerId)) return;
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		const pts = [...pointers.values()];

		if (pts.length === 2) {
			const scale = pointerDist(pts[0], pts[1]) / gestureStartDist;
			const mid = midpoint(pts[0], pts[1]);
			zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, gestureStartZoom * scale));
			({ x: panX, y: panY } = clampPan(
				gestureStartPan.x + (mid.x - gestureStartMid.x),
				gestureStartPan.y + (mid.y - gestureStartMid.y),
				zoom
			));
		} else if (pts.length === 1 && zoom > MIN_ZOOM) {
			const p = pts[0];
			({ x: panX, y: panY } = clampPan(
				gestureStartPan.x + (p.x - gestureStartMid.x),
				gestureStartPan.y + (p.y - gestureStartMid.y),
				zoom
			));
		}
	}

	function endPointer(e: PointerEvent) {
		pointers.delete(e.pointerId);
		if (pointers.size === 0) {
			gesturing = false;
		} else {
			beginGesture();
		}
	}
</script>

<DialogRoot bind:open>
	<DialogTrigger>
		<enhanced:img
			{src}
			{alt}
			class={cn('h-auto max-h-150 max-w-full rounded-xl shadow', className)}
		/>
	</DialogTrigger>
	<DialogPortal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
		/>
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 h-[88vh] w-[95vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
		>
			<div class="relative h-full w-full">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					bind:this={stageEl}
					class="h-full w-full touch-none overflow-hidden rounded-2xl"
					onpointerdown={onStagePointerDown}
					onpointermove={onStagePointerMove}
					onpointerup={endPointer}
					onpointercancel={endPointer}
					onwheel={onWheel}
				>
					<img
						bind:this={imgEl}
						{src}
						{alt}
						draggable="false"
						class="h-full w-full touch-none object-contain select-none"
						style="transform: translate({panX}px, {panY}px) scale({zoom}); transition: {gesturing
							? 'none'
							: 'transform 150ms ease-out'}; cursor: {zoom > MIN_ZOOM
							? pointers.size > 0
								? 'grabbing'
								: 'grab'
							: 'default'}"
					/>
				</div>

				<Dialog.Close
					class="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-lg"
				>
					<XIcon size={16} />
					<span class="sr-only">Close</span>
				</Dialog.Close>

				<div class="absolute top-3 left-3 flex items-center gap-1.5">
					<button
						type="button"
						class="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-lg disabled:opacity-40"
						onclick={zoomOut}
						disabled={zoom <= MIN_ZOOM}
						aria-label="Zoom out"
					>
						<ZoomOutIcon size={16} />
					</button>
					<button
						type="button"
						class="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-lg disabled:opacity-40"
						onclick={zoomIn}
						disabled={zoom >= MAX_ZOOM}
						aria-label="Zoom in"
					>
						<ZoomInIcon size={16} />
					</button>
				</div>
			</div>
		</Dialog.Content>
	</DialogPortal>
</DialogRoot>
