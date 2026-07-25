import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

// Wasm modules must reach wrangler's own bundler untouched so it can precompile them;
// Vite's built-in wasm handling instantiates from raw bytes at runtime, which Workers disallows.
function wasmExternal(): Plugin {
	return {
		name: 'wasm-external',
		enforce: 'pre',
		async resolveId(source, importer) {
			if (!source.endsWith('.wasm')) return;
			const resolved = await this.resolve(source, importer, { skipSelf: true });
			if (resolved) return { id: resolved.id, external: 'absolute' };
		}
	};
}

export default defineConfig({
	server: {
		fs: {
			allow: ['.']
		}
	},
	plugins: [
		wasmExternal(),
		tailwindcss(),
		enhancedImages(),
		sveltekit(),
		paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' })
	]
});
