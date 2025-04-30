<script lang="ts">
	import { blur } from 'svelte/transition';
	import ProjectBlurb from '$lib/components/ProjectBlurb.svelte';
</script>

{#snippet hbar()}
	<hr class="border-secondary/60 mt-2 mb-8" />
{/snippet}

<div class="prose absolute flex w-full max-w-full flex-col" transition:blur>
	<div class="flex flex-col">
		<ProjectBlurb title="line, pls?">
			{#snippet col1()}
				<p>
					<a href="https://tcql.github.io/line-pls"><strong>line-pls</strong></a> is a simple line-by-line
					text reader. Built for a friend to make it easier to read Project Gutenberg texts.
				</p>
				<p>Built with:</p>
				<ul>
					<li>Svelte 5 & SvelteKit</li>
					<li>TailwindCSS</li>
					<li>DaisyUI</li>
				</ul>
			{/snippet}
			{#snippet col2()}
				<img
					class="not-prose rounded-md"
					alt="side-by-side of several color scheme options for a line-by-line text reading interface"
					src="projects-line-pls.png"
				/>
			{/snippet}
		</ProjectBlurb>

		{@render hbar()}

		<ProjectBlurb title="dr-kinesis" forceCol>
			{#snippet col1()}
				<p>
					<a href="https://github.com/tcql/dr-kinesis"><strong>dr-kinesis</strong></a> is a CLI program
					for downloading, filtering, and investigating streaming data from AWS Kinesis and Firehose.
					Built in Node.js, this tool was intended to make it easier for me and my team to diagnose data
					issues with very minimal overhead.
				</p>

				<p>
					Alongside dr-kinesis is
					<a href="https://github.com/tcql/schema-buddy"><strong>schema-buddy</strong></a>, a little
					friend to help with validating and summarizing JSONSchema
				</p>
			{/snippet}
			{#snippet col2()}
				<img
					class="not-prose rounded-md"
					alt="an animation of a terminal, showing usage of dr-kinesis. the user selects local firehose data, types in a filter, and is shown a series of results"
					src="projects-dr-kinesis.svg"
				/>
			{/snippet}
		</ProjectBlurb>

		{@render hbar()}

		<ProjectBlurb title="openXA" reverse={true}>
			{#snippet col1()}
				<p>
					<a href="https://ghostcatte.codeberg.page/exa-viewer/"><strong>openXA</strong></a> is a
					JavaScript implementation of the fictional AXIOM language used in the videogame
					<a href="https://www.zachtronics.com/exapunks/">EXAPUNKS</a>. openXA implements all of the
					language components, and a basic scripting environment
				</p>
				<p>Built with:</p>
				<ul>
					<li>Svelte</li>
					<li>Grammar and parsing with <a href="https://ohmjs.org">Ohm.js</a></li>
				</ul>
			{/snippet}
			{#snippet col2()}
				<img
					class="not-prose rounded-md"
					alt="screenshot of OpenXA - several code editors are visible, and the values of data registers are displayed next to each"
					src="projects-openxa.png"
				/>
			{/snippet}
		</ProjectBlurb>
	</div>
</div>
