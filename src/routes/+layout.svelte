<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/marcus.png';
	import LangTooltip from '$lib/components/LangTooltip.svelte';
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<title>마아앙</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="border-b border-primary/20 bg-gradient-to-b from-primary/10 to-base-100">
	<!-- 상단 장식선 -->
	<div class="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent"></div>

	<div class="navbar mx-auto max-w-screen-2xl px-8 py-3">
		<div class="navbar-start gap-3">
			<a
				href={resolve('/')}
				class="font-playfair text-xl font-bold tracking-widest text-primary uppercase"
				style="font-family: 'Playfair Display', serif;"
			>
				maaang
			</a>
		</div>

		<div class="navbar-end items-center gap-3">
			<LangTooltip />
		</div>
	</div>

	<!-- 하단 장식선 -->
	<div class="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
</header>

<div class="mx-auto max-w-screen-2xl">
	{@render children()}
</div>
