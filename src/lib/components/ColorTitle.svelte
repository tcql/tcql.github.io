<script lang="ts">
	import { darkMode } from '$lib/stores';
	interface Props {
		title: string;
	}
	let { title }: Props = $props();
</script>

<div class="relative mb-6 h-12">
	<h1 class="text-accent/30 absolute top-3.5 left-9">{title}</h1>
	<h1 class="text-secondary/40 absolute top-2.5 left-6">{title}</h1>
	<h1 class="text-primary/50 absolute top-1.5 left-3">{title}</h1>

	<h1 class="absolute">{title}</h1>
</div>
