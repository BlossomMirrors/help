<script lang="ts">
	let { data } = $props();
</script>

{#key data.Content}
	<data.Content />
{/key}
