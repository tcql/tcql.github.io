<script lang="ts">
	import { darkMode } from '$lib/stores';
	import type { Snippet } from 'svelte';
	import ColorTitle from './ColorTitle.svelte';

	interface Props {
		title: string;
		col1: Snippet;
		col2?: Snippet | null;
		reverse?: boolean;
		forceCol?: boolean;
	}
	let { title, col1, col2 = null, reverse = false, forceCol = false }: Props = $props();
</script>

<div>
	<ColorTitle {title} />
	<div
		class="flex flex-col-reverse items-center gap-4 pt-2 pb-8"
		class:md:flex-row-reverse={reverse && !forceCol}
		class:md:flex-row={!reverse && !forceCol}
	>
		<div class="flex-2">
			{@render col1()}
		</div>
		{#if col2}
			<div class="flex-3">
				{@render col2()}
			</div>
		{/if}
	</div>
</div>
