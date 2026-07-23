// Hand-extracted from @lucide/svelte's iconNode data (the same paths the site's
// Lucide icons render from) so the OG image generator can draw them without a
// runtime dependency on @lucide/svelte, which is a devDependency and isn't
// installed in the production image.
type IconShape = [string, Record<string, string>];

export const iconNodes: Record<string, IconShape[]> = {
	users: [
		['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
		['path', { d: 'M16 3.128a4 4 0 0 1 0 7.744' }],
		['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }],
		['circle', { cx: '9', cy: '7', r: '4' }]
	],
	'gamepad-2': [
		['line', { x1: '6', x2: '10', y1: '11', y2: '11' }],
		['line', { x1: '8', x2: '8', y1: '9', y2: '13' }],
		['line', { x1: '15', x2: '15.01', y1: '12', y2: '12' }],
		['line', { x1: '18', x2: '18.01', y1: '10', y2: '10' }],
		[
			'path',
			{
				d: 'M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z'
			}
		]
	],
	code: [
		['path', { d: 'm16 18 6-6-6-6' }],
		['path', { d: 'm8 6-6 6 6 6' }]
	],
	'scroll-text': [
		['path', { d: 'M15 12h-5' }],
		['path', { d: 'M15 8h-5' }],
		['path', { d: 'M19 17V5a2 2 0 0 0-2-2H4' }],
		[
			'path',
			{
				d: 'M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3'
			}
		]
	],
	package: [
		[
			'path',
			{
				d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z'
			}
		],
		['path', { d: 'M12 22V12' }],
		['polyline', { points: '3.29 7 12 12 20.71 7' }],
		['path', { d: 'm7.5 4.27 9 5.15' }]
	],
	'package-open': [
		['path', { d: 'M12 22v-9' }],
		[
			'path',
			{
				d: 'M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z'
			}
		],
		[
			'path',
			{
				d: 'M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13'
			}
		],
		[
			'path',
			{
				d: 'M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z'
			}
		]
	],
	cloud: [['path', { d: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z' }]],
	'hard-drive': [
		['path', { d: 'M10 16h.01' }],
		[
			'path',
			{
				d: 'M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'
			}
		],
		['path', { d: 'M21.946 12.013H2.054' }],
		['path', { d: 'M6 16h.01' }]
	],
	disc: [
		['circle', { cx: '12', cy: '12', r: '10' }],
		['circle', { cx: '12', cy: '12', r: '2' }]
	],
	'refresh-cw': [
		['path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }],
		['path', { d: 'M21 3v5h-5' }],
		['path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }],
		['path', { d: 'M8 16H3v5' }]
	],
	monitor: [
		['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
		['line', { x1: '8', x2: '16', y1: '21', y2: '21' }],
		['line', { x1: '12', x2: '12', y1: '17', y2: '21' }]
	],
	download: [
		['path', { d: 'M12 15V3' }],
		['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }],
		['path', { d: 'm7 10 5 5 5-5' }]
	],
	'book-open': [
		['path', { d: 'M12 7v14' }],
		[
			'path',
			{
				d: 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'
			}
		]
	],
	bot: [
		['path', { d: 'M12 8V4H8' }],
		['rect', { width: '16', height: '12', x: '4', y: '8', rx: '2' }],
		['path', { d: 'M2 14h2' }],
		['path', { d: 'M20 14h2' }],
		['path', { d: 'M15 13v2' }],
		['path', { d: 'M9 13v2' }]
	],
	'git-pull-request': [
		['circle', { cx: '18', cy: '18', r: '3' }],
		['circle', { cx: '6', cy: '6', r: '3' }],
		['path', { d: 'M13 6h3a2 2 0 0 1 2 2v7' }],
		['line', { x1: '6', x2: '6', y1: '9', y2: '21' }]
	],
	'shield-check': [
		[
			'path',
			{
				d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'
			}
		],
		['path', { d: 'm9 12 2 2 4-4' }]
	],
	sparkles: [
		[
			'path',
			{
				d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z'
			}
		],
		['path', { d: 'M20 2v4' }],
		['path', { d: 'M22 4h-4' }],
		['circle', { cx: '4', cy: '20', r: '2' }]
	],
	sword: [
		['path', { d: 'm11 19-6-6' }],
		['path', { d: 'm5 21-2-2' }],
		['path', { d: 'm8 16-4 4' }],
		['path', { d: 'M9.5 17.5 21 6V3h-3L6.5 14.5' }]
	],
	tag: [
		[
			'path',
			{
				d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z'
			}
		],
		['circle', { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }]
	],
	'test-tube': [
		['path', { d: 'M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2' }],
		['path', { d: 'M8.5 2h7' }],
		['path', { d: 'M14.5 16h-5' }]
	],
	zap: [
		[
			'path',
			{
				d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'
			}
		]
	]
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderIcon(name: string, color: string, size = 22): any {
	const shapes = iconNodes[name] ?? iconNodes['book-open'];
	return {
		type: 'svg',
		props: {
			viewBox: '0 0 24 24',
			width: size,
			height: size,
			fill: 'none',
			stroke: color,
			strokeWidth: 2,
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
			children: shapes.map(([tag, attrs]) => ({ type: tag, props: attrs }))
		}
	};
}
