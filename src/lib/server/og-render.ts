// Isolated from +server.ts and reached only via a dynamic import of this module
// (never the .wasm files directly): SvelteKit's build-time route analysis loads
// +server.ts in plain Node/Deno to inspect its exports, and that runtime's native
// wasm-as-ESM handling can't deal with wasm-bindgen's raw import/export ABI. Static
// imports here are fine since analysis never reaches this file, while wrangler still
// sees them as static and precompiles them into the Worker bundle.
import satori, { init as initSatori, type SatoriOptions } from 'satori/standalone';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from './resvg.wasm';
import yogaWasm from 'satori/yoga.wasm';

let wasmReady: Promise<void> | null = null;

function ensureWasmInit() {
	wasmReady ??= Promise.all([initWasm(resvgWasm), initSatori(yogaWasm)]).then(() => undefined);
	return wasmReady;
}

export async function renderOgPng(node: Parameters<typeof satori>[0], options: SatoriOptions) {
	await ensureWasmInit();
	const svg = await satori(node, options);
	// This resvg-wasm build only recognizes the legacy xlink:href on <image>,
	// not the bare SVG2 href satori emits, so embedded images render blank.
	// The xlink prefix also needs its namespace declared on the root <svg>,
	// or resvg's strict XML parser rejects the whole document.
	const patchedSvg = svg
		.replace(/<image ([^>]*?)href=/g, '<image $1xlink:href=')
		.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
	// resvg-wasm's Resvg/RenderedImage wrap Rust structs and don't get garbage
	// collected automatically; without an explicit free() their wasm-linear-memory
	// accumulates across requests in the same warm isolate until it hits the limit.
	const resvg = new Resvg(patchedSvg, {
		fitTo: { mode: 'width', value: 1200 },
		font: { loadSystemFonts: false }
	});
	const rendered = resvg.render();
	const png = rendered.asPng();
	rendered.free();
	resvg.free();
	return png;
}
