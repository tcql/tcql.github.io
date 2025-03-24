<script lang="ts">
	import type { Snippet } from 'svelte';
	import { blur } from 'svelte/transition';
	interface Props {
		title: string;
		children: Snippet;
	}
	let { title = '', children }: Props = $props();
</script>

<div transition:blur class="prose">
	{#if title !== ''}
		<h1>{title}</h1>
	{/if}
	{@render children?.()}
</div>
