<script lang="ts">
	import TextTooltipHighlight from '$lib/components/TextTooltipHighlight.svelte';
	import { blur } from 'svelte/transition';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="prose absolute w-full max-w-full" transition:blur>
	list some projects here, I guess!
</div>
