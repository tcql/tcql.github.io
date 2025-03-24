<script lang="ts">
	import { Icon, Moon, Sun } from 'svelte-hero-icons';

	interface RouteProps {
		title: string;
		url: string;
	}
	const routes: RouteProps[] = [
		{ title: 'about', url: '/' },
		{ title: 'projects', url: '/projects' }
	];
</script>

{#snippet pagelink(title: string, url: string)}
	<li><a href={url}>{title}</a></li>
{/snippet}

<div class="navbar bg-base-200 shadow-sm">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</div>
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
			>
				{#each routes as { title, url }}
					{@render pagelink(title, url)}
				{/each}
			</ul>
		</div>
		<a class="btn btn-ghost text-xl">tcql</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			{#each routes as { title, url }}
				{@render pagelink(title, url)}
			{/each}
		</ul>
	</div>
	<div class="navbar-end">
		<label class="flex cursor-pointer items-center gap-2">
			<Icon src={Sun} size="16" />
			<input type="checkbox" value="dim" class="toggle theme-controller" />
			<Icon src={Moon} size="16" />
		</label>
	</div>
</div>
