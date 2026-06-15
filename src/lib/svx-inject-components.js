import fs from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const layoutPath = resolve(dirname(fileURLToPath(import.meta.url)), 'md-layout.svelte');

export function injectSvxComponents() {
	const src = fs.readFileSync(layoutPath, 'utf8');
	const block = src.match(/export\s*\{([^}]+)\}/)?.[1] ?? '';
	const names = [...new Set([...block.matchAll(/\b([A-Z][A-Za-z0-9]*)\b/g)].map((m) => m[1]))];
	if (!names.length) return { markup: () => undefined };
	const importLine = `import { ${names.join(', ')} } from '$lib/md-layout.svelte';`;
	return {
		markup({ content, filename }) {
			if (!filename?.endsWith('.svx')) return;
			const scriptRe = /<script(?![^>]*\bmodule\b)[^>]*>/;
			if (scriptRe.test(content))
				return { code: content.replace(scriptRe, (m) => `${m}\n\t${importLine}`) };
			const fm = content.match(/^---[\s\S]*?\n---\n?/);
			const offset = fm ? fm[0].length : 0;
			return {
				code:
					content.slice(0, offset) +
					`\n<script>\n\t${importLine}\n</script>\n` +
					content.slice(offset)
			};
		}
	};
}
