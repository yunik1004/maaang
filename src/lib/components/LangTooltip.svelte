<script lang="ts">
	import { interpRules, transpilerRules } from '$lib/lang-rules';

	let open = $state(false);
	let tab = $state<'interpreter' | 'transpiler'>('interpreter');
</script>

<button
	class="text-xs tracking-widest text-base-content/50 uppercase transition-colors hover:text-primary"
	onclick={() => (open = true)}
>
	Rules
</button>

{#if open}
	<!-- 배경 오버레이 -->
	<div
		class="fixed inset-0 z-40 bg-black/60"
		role="button"
		tabindex="-1"
		onclick={() => (open = false)}
		onkeydown={(e) => e.key === 'Escape' && (open = false)}
	></div>

	<!-- 모달 -->
	<div
		class="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] flex-col border border-primary/40 bg-base-200 shadow-2xl"
	>
		<!-- 상단 장식선 -->
		<div class="h-0.5 w-full shrink-0 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

		<div class="flex min-h-0 flex-col">
			<!-- 헤더 -->
			<div class="shrink-0 flex items-center justify-between px-8 pt-8 mb-4">
				<div class="flex items-center gap-3">
					<div class="h-px w-8 bg-primary/50"></div>
					<h2
						class="text-lg tracking-[0.3em] text-primary uppercase"
						style="font-family: 'Playfair Display', serif;"
					>
						Language Rules
					</h2>
					<div class="h-px w-8 bg-primary/50"></div>
				</div>
				<button
					class="text-lg text-base-content/30 transition-colors hover:text-primary"
					onclick={() => (open = false)}
				>
					✕
				</button>
			</div>

			<!-- 탭 -->
			<div class="shrink-0 flex border-b border-primary/20 px-8">
				{#each (['interpreter', 'transpiler'] as const) as t}
					<button
						class="px-4 py-2 text-xs tracking-widest uppercase transition-colors
							{tab === t
								? 'border-b-2 border-primary text-primary'
								: 'text-base-content/40 hover:text-primary'}"
						onclick={() => (tab = t)}
					>
						{t}
					</button>
				{/each}
			</div>

			<!-- 규칙 목록 -->
			<ul class="space-y-3 overflow-y-auto px-8 py-6">
				{#each (tab === 'interpreter' ? interpRules : transpilerRules) as entry}
					{#if entry.kind === 'section'}
						<li class="pt-3 first:pt-0">
							<span class="text-[10px] tracking-[0.25em] text-primary/50 uppercase">
								{entry.title}
							</span>
							<div class="mt-1 h-px bg-primary/15"></div>
						</li>
					{:else}
						<li class="border-l-2 border-primary/30 pl-4">
							<span class="text-[11px] tracking-widest text-base-content/40 uppercase">{entry.title}</span>
							<code class="mt-1 block whitespace-pre font-mono text-sm text-primary/90">{entry.example}</code>
						</li>
					{/if}
				{/each}
			</ul>
		</div>

		<!-- 하단 장식선 -->
		<div class="h-px w-full shrink-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
	</div>
{/if}
