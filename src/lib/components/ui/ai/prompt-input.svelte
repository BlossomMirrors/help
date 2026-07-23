<script lang="ts">
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import Button from '$lib/components/ui/button/button.svelte';

	let {
		onsubmit,
		disabled = false,
		placeholder = 'Ask a question…'
	}: {
		onsubmit: (text: string) => void;
		disabled?: boolean;
		placeholder?: string;
	} = $props();

	let value = $state('');
	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	export function focus() {
		textareaEl?.focus();
	}

	function resize() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = Math.min(textareaEl.scrollHeight, 120) + 'px';
	}

	function submit() {
		const text = value.trim();
		if (!text || disabled) return;
		value = '';
		if (textareaEl) textareaEl.style.height = 'auto';
		onsubmit(text);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	}
</script>

<div class="flex items-end gap-2 border-t border-border bg-popover p-3">
	<textarea
		bind:this={textareaEl}
		bind:value
		{placeholder}
		{disabled}
		rows={1}
		oninput={resize}
		{onkeydown}
		class="max-h-[120px] flex-1 resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus:border-primary/40 disabled:opacity-50"
	></textarea>
	<Button onclick={submit} disabled={disabled || !value.trim()} size="icon" class="mb-0.5 shrink-0">
		<ArrowUpIcon size={16} />
	</Button>
</div>
