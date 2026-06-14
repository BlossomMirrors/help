import { m } from '$lib/paraglide/messages';

const alertLabels: Record<string, () => string> = {
	note: m.alert_note,
	tip: m.alert_tip,
	important: m.alert_important,
	warning: m.alert_warning,
	caution: m.alert_caution
};

export function initMdComponents(root: HTMLElement) {
	root.querySelectorAll<HTMLElement>('.admonition-title[data-type]').forEach((el) => {
		const type = el.dataset.type ?? '';
		el.textContent = alertLabels[type]?.() ?? type;
	});
}
