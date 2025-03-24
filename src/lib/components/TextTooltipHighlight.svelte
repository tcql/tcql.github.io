<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tooltip: Snippet;
		children?: Snippet;
		colorClasses?: string;
		test?: Snippet;
	}
	let {
		tooltip,
		children,
		colorClasses = 'bg-primary-content/90 text-primary',
		test
	}: Props = $props();
</script>

<span class="tooltip">
	<span class="tooltip-content">{@render tooltip?.()}</span>
	<span class="{colorClasses} cursor-pointer rounded-md px-2 py-1 font-bold">
		{@render children?.()}
	</span>
</span>
