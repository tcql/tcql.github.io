<script lang="ts">
	import { main } from '$lib/pixiboids';
	import type { Application } from 'pixi.js';
	import { onDestroy, onMount } from 'svelte';

	let app: Application;
	let canvas: HTMLElement;
	onMount(async () => {
		const targetFps = 60;
		app = await main(canvas, {
			updates: {
				mainLoopFps: targetFps,
				trailsLoopFps: 30,
				lifeLoopFps: 60
			},
			performance: {
				autoReduceBoids: true,
				autoReduceRate: 0.1,
				minimumBoids: 450,
				fpsTestWindow: targetFps,
				fpsThreshold: targetFps * 0.7
			},
			stats: false,
			numBoids: 700,
			maxSpeed: 60,
			visualRange: 80,
			centeringFactor: 0.01,
			matchingFactor: 0.04,
			speedWobbleChance: 0.07,
			speedWobbleMax: 18,
			trails: {
				historyLength: 12,
				updateFrequency: 0.1,
				maxWidth: 4,
				minWidth: 2,
				minOpacity: 0.5
			},
			separation: {
				minDistanceMax: 16, // The distance to stay away from other boids
				minDistanceMin: 2,
				avoidFactor: 0.15, // Adjust velocity by this % when moving away from other boids
				maxNearby: 6, // if too many boids are close by, try to break off a bit
				nearbyAvoidFactor: 0.8 // increase avoidance to more drastically move away
			},
			flockColors: ['--color-primary', '--color-secondary', '--color-accent'],
			computedStyle: getComputedStyle(document.body)
		});
		canvas.appendChild(app.canvas);
	});

	onDestroy(() => {
		console.log('cleanup');
		app?.destroy?.(true, { children: true, texture: true, context: true });
	});
</script>

<div class="mb-6 h-128 w-full overflow-clip rounded-lg bg-gray-300" bind:this={canvas}></div>

<style>
	:global(#stats) {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
	}

	:global(#stats canvas) {
		width: max(100px, 10vw, 10vh);
		height: max(60px, 6vh, 6vw);
		user-select: none;
	}
</style>
