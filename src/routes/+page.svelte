<script lang="ts">
	import CyclingText from '$lib/components/CyclingText.svelte';
	import PixiBoidsWrapper from '$lib/components/PixiBoidsWrapper.svelte';
	import TextTooltipHighlight from '$lib/components/TextTooltipHighlight.svelte';
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

{#snippet smallpipeList(list: string[])}
	<p>
		{#each list as item, idx}
			{item}
			{#if idx !== list.length - 1}
				<span class="text-base-content/40">&nbsp;|&nbsp;</span>
			{/if}
		{/each}
	</p>
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

	<div class="relative">
		<PixiBoidsWrapper />
		<div
			class="absolute top-0 mx-auto flex h-full w-full flex-col items-stretch justify-center gap-4 px-8"
		>
			<div class="bg-base-300/90 rounded-box border-primary border-2 px-4 py-2 text-sm">
				<strong>Languages</strong>
				{@render smallpipeList([
					'JavaScript, TypeScript, Node.JS',
					'Python',
					'SQL',
					'HTML',
					'CSS',
					'PHP',
					'Lua',
					'C#, C++',
					'Java',
					'Go'
				])}
			</div>
			<div class="bg-base-300/90 rounded-box border-secondary border-2 px-4 py-2 text-sm">
				<strong>Web Frameworks & Tools</strong>
				{@render smallpipeList([
					'Svelte',
					'Django',
					'Tailwind, DaisyUI',
					'MapboxGL',
					'D3',
					'Laravel',
					'PIXI.js',
					'React',
					'Angular',
					'Knockout'
				])}
			</div>
			<div class="bg-base-300/90 rounded-box border-accent border-2 px-4 py-2 text-sm">
				<strong>Software & Systems</strong>
				{@render smallpipeList([
					'AWS, CloudFormation',
					'Postgres',
					'Redis',
					'Git',
					'Airflow',
					'Spark',
					'GDAL'
				])}
			</div>
		</div>
	</div>
</div>
