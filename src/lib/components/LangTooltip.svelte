<script lang="ts">
	import { rules } from '$lib/lang-rules';

	let open = $state(false);
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
		class="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-primary/40 bg-base-200 shadow-2xl"
	>
		<!-- 상단 장식선 -->
		<div class="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent"></div>

		<div class="p-8">
			<!-- 헤더 -->
			<div class="mb-6 flex items-center justify-between">
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

			<!-- 규칙 목록 -->
			<ul class="space-y-4">
				{#each rules as rule (rule.title)}
					<li class="border-l-2 border-primary/30 pl-4">
						<span class="text-[11px] tracking-widest text-base-content/40 uppercase"
							>{rule.title}</span
						>
						<code class="mt-1 block font-mono text-sm text-primary/90">{rule.example}</code>
					</li>
				{/each}
			</ul>
		</div>

		<!-- 하단 장식선 -->
		<div class="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
	</div>
{/if}
