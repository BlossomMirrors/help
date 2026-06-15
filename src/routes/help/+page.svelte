<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	if (browser) {
		goto('/help/user', { replaceState: true });
	}
</script>
