<script lang="ts">
	import { transpile } from '$lib/transpiler';

	let input = $state(`# Python 코드를 입력하세요

print("마아앙")
`);
	let output = $state<string | null>(null);
	let isRunning = $state(false);

	function handleTranspile() {
		isRunning = true;
		output = null;
		try {
			output = transpile(input);
		} catch (e) {
			output = `[오류] ${e instanceof Error ? e.message : String(e)}`;
		} finally {
			isRunning = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			handleTranspile();
		}
	}
</script>

<div class="flex h-[calc(100vh-57px)] flex-col">
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Python 입력 -->
		<div class="flex flex-1 flex-col border-b border-primary/20">
			<div
				class="flex items-center justify-between border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent px-4 py-1.5"
			>
				<span class="text-xs tracking-widest text-primary uppercase">Python</span>
				<div class="flex items-center gap-3">
					<span class="text-xs text-base-content/30">Ctrl + Enter</span>
					<button
						class="btn text-xs tracking-widest uppercase btn-xs btn-primary"
						onclick={handleTranspile}
						disabled={isRunning}
					>
						{#if isRunning}
							<span class="loading loading-xs loading-spinner"></span>
							변환 중
						{:else}
							▶ 변환
						{/if}
					</button>
				</div>
			</div>
			<textarea
				class="flex-1 resize-none bg-base-100 p-6 font-mono text-sm leading-relaxed text-base-content outline-none"
				bind:value={input}
				onkeydown={handleKeydown}
				spellcheck={false}
				autocomplete="off"
				autocapitalize="off"
			></textarea>
		</div>

		<!-- maang 출력 -->
		<div class="flex flex-1 flex-col border-t border-primary/20">
			<div
				class="border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent px-4 py-1.5"
			>
				<span class="text-xs tracking-widest text-primary uppercase">maang</span>
			</div>
			<div class="flex-1 overflow-auto bg-base-100 p-6 font-mono text-sm leading-relaxed">
				{#if output === null}
					<p class="text-xs tracking-widest text-base-content/20 uppercase">
						— 변환 결과가 여기에 표시됩니다 —
					</p>
				{:else if output === ''}
					<p class="text-xs tracking-widest text-base-content/40 uppercase">— 출력 없음 —</p>
				{:else}
					<pre class="whitespace-pre-wrap text-base-content">{output}</pre>
				{/if}
			</div>
		</div>
	</div>
</div>
