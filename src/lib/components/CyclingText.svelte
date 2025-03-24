<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { fly } from 'svelte/transition';

	interface Props {
		options: string[];
		timeout?: number;
		duration?: number;
	}

	let { timeout = 1000, options = [], duration = 600 }: Props = $props();
	let currOption = $state(0);
	let prevOption = $state(0);

	onMount(() => {
		setInterval(() => {
			if (options[currOption + 1]) {
				currOption++;
			} else {
				currOption = 0;
			}
		}, timeout);
	});
</script>

<div class="inline">
	{#key currOption}
		{#if prevOption !== currOption}
			<div class="absolute" out:fly={{ duration, y: -30 }}>{options[prevOption]}</div>
		{/if}
		<div
			class="absolute"
			in:fly={{ duration, y: 30 }}
			onintrostart={() => (prevOption = currOption)}
		>
			{options[currOption]}
		</div>
	{/key}
</div>
