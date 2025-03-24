<script lang="ts">
	import CyclingText from '$lib/components/CyclingText.svelte';
	import PixiTest from '$lib/components/PixiTest.svelte';
	import TextTooltipHighlight from '$lib/components/TextTooltipHighlight.svelte';
	import { createRawSnippet } from 'svelte';
	import { blur } from 'svelte/transition';

	interface EmploymentArgs {
		company: string;
		jobTitle: string;
		startYear: number;
		endYear?: number;
	}

	const year = new Date().getFullYear();
	const startYear = 2010;
	const yearsInDev = year - startYear;
</script>

{#snippet employment({ company, jobTitle, startYear, endYear }: EmploymentArgs)}
	{company}, <em>{jobTitle}</em> <br />
	{startYear} - {endYear}
{/snippet}

{#snippet employmentTooltip(text: string, args: EmploymentArgs, colorClasses = '')}
	<TextTooltipHighlight {colorClasses}>
		{#snippet tooltip()}
			{@render employment(args)}
		{/snippet}
		{text}
	</TextTooltipHighlight>
{/snippet}

<div class="prose absolute w-full max-w-full" transition:blur>
	<div class="flex text-3xl font-bold">
		<span>👋, I'm&nbsp;</span>
		<div class="text-secondary">
			<CyclingText
				timeout={2000}
				options={[
					'Tim Channell',
					'a software engineer',
					'an artist',
					'known to some as "tcql"',
					'a Libra sun, Sagittarius moon, Cancer rising',
					'open to work™',
					'a Full-Stack / Generalist Engineer',
					'making games'
				]}
			/>
		</div>
	</div>

	<p>
		I make software, music, and art. I've been writing software (professionally) for
		<TextTooltipHighlight>
			{#snippet tooltip()}
				current year ({year}) - {startYear} = {yearsInDev} years<br />

				{#if yearsInDev < 15}
					y... wait a sec. did you mess with the clock?
				{:else}
					yep, the math checks out.
				{/if}
			{/snippet}

			{yearsInDev}
		</TextTooltipHighlight> years. Less professionally, much longer. I've done a lot of a lot, and a
		little of even more.
	</p>
	<p>
		My work has taken me from {@render employmentTooltip(
			'ag tech',
			{
				company: 'MyFarms',
				jobTitle: 'Software Engineer',
				startYear: 2011,
				endYear: 2015
			},
			'bg-primary-content/90 text-primary'
		)}, to {@render employmentTooltip(
			'geospatial',
			{
				company: 'Mapbox',
				jobTitle: 'Senior Software Engineer',
				startYear: 2015,
				endYear: 2021
			},
			'bg-secondary-content/90 text-secondary'
		)}, to {@render employmentTooltip(
			'power systems and carbon',
			{
				company: 'Kevala Analytics',
				jobTitle: 'Senior Full Stack Engineer',
				startYear: 2022,
				endYear: 2025
			},
			'bg-accent-content/90 text-accent'
		)} analysis. I've done web app frontends, data warehousing, open-source tooling, APIs, and image
		processing.
	</p>
	<div class="mb-6 h-86 w-full rounded-lg bg-gray-300 p-12">
		<h3>todo: add some graphics/interactive in this box</h3>
		<ul>
			<li>somethin' with maps?</li>
			<li>small canvas painter?</li>
			<li>boids?</li>
			<li>dragonsweeper-ish?</li>
		</ul>
	</div>
</div>
