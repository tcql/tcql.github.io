<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<div class="flex flex-col">
	<Header />
	<div class="flex-1">
		<div class="mx-auto max-w-3xl py-8">
			{@render children()}
		</div>
	</div>
</div>
