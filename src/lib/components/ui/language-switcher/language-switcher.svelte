<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { locales, getLocale, setLocale } from '$lib/paraglide/runtime';

	import type { Component } from 'svelte';

	import enFlag from '$lib/components/icons/flags/en.svelte';
	import deFlag from '$lib/components/icons/flags/de.svelte';

	const flags: Record<string, Component> = { en: enFlag, de: deFlag };
	const labels: Record<string, string> = { en: 'English', de: 'Deutsch' };

	let current = $state(getLocale());
</script>

<Select.Root
	type="single"
	value={current}
	onValueChange={(v) => {
		if (v) {
			current = v as 'de' | 'en';
			setLocale(v as 'de' | 'en');
		}
	}}
>
	<Select.Trigger class={buttonVariants({ variant: 'default' })}>
		<div class="flex items-center">
			{#if flags[current]}
				{@const Flag = flags[current]}
				<Flag class="h-4 w-auto" />
			{/if}
		</div>
	</Select.Trigger>
	<Select.Content>
		{#each locales as locale (locale)}
			<Select.Item value={locale}>
				<div class="flex items-center gap-2">
					{#if flags[locale]}
						{@const Flag = flags[locale]}
						<Flag class="h-4 w-auto" />
					{/if}
					{labels[locale]}
				</div>
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
