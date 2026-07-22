<script lang="ts">
	import { page } from '$app/state';
	import HomeIcon from '@lucide/svelte/icons/house';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
</script>

<svelte:head><title>{page.status} - Blossom Help</title></svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
	<p class="font-serif text-[9rem] font-bold leading-none text-primary/10">{page.status}</p>
	<h1 class="mt-2 text-2xl font-semibold">
		{page.error?.message ?? 'Something went wrong'}
	</h1>
	<p class="mt-3 max-w-sm text-muted-foreground">
		{#if page.status === 404}
			This page doesn't exist or was moved.
		{:else}
			An unexpected error occurred. Try refreshing the page.
		{/if}
	</p>
	<div class="mt-8 flex items-center gap-3">
		<a
			href="/help"
			class="inline-flex items-center gap-2 rounded-button bg-button px-4 py-2 text-sm font-medium text-button-foreground transition-colors hover:bg-button-hover"
		>
			<BookOpenIcon size={16} strokeWidth={2} />
			Help Center
		</a>
		<a
			href="/"
			class="inline-flex items-center gap-2 rounded-button border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-button-hover"
		>
			<HomeIcon size={16} strokeWidth={2} />
			Home
		</a>
	</div>
</div>
