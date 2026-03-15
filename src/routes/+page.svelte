<script lang="ts">
	import { run } from '$lib/interpreter';
	import { transpile } from '$lib/transpiler';
	import maaangImg from '$lib/assets/maaang.png';

	type Tab = 'interpreter' | 'transpiler';
	let tab = $state<Tab>('interpreter');

	// interpreter
	let interpCode = $state(`마아아아아앙..... 마아아앙 마아아앙..... 마아아앙 망! 마아앙! 마아앙! 마아아아아앙... 망! 자허... 마앙?
마아아앙 마아아아아앙..... 마아아앙. 마아앙! 마아아아아앙.. 망! 마아앙! 망! 자허... 마앙?
마아아아아앙.. 마앙 망! 망! 마앙?
`);
	let interpOutput = $state<string | null>(null);
	let interpCopied = $state(false);
	let transpileCopied = $state(false);

	async function copyToClipboard(text: string, which: 'interp' | 'transpile') {
		await navigator.clipboard.writeText(text);
		if (which === 'interp') {
			interpCopied = true;
			setTimeout(() => (interpCopied = false), 1500);
		} else {
			transpileCopied = true;
			setTimeout(() => (transpileCopied = false), 1500);
		}
	}

	function handleRun() {
		try {
			interpOutput = run(interpCode);
		} catch (e) {
			interpOutput = `[오류] ${e instanceof Error ? e.message : String(e)}`;
		}
	}

	// transpiler
	let transpileInput = $state(`print("마아앙")
`);
	let transpileOutput = $state<string | null>(null);

	function handleTranspile() {
		try {
			transpileOutput = transpile(transpileInput);
		} catch (e) {
			transpileOutput = `[오류] ${e instanceof Error ? e.message : String(e)}`;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			if (tab === 'interpreter') handleRun();
			else handleTranspile();
		}
		if (e.key === 'Tab') {
			e.preventDefault();
			const ta = e.currentTarget as HTMLTextAreaElement;
			const start = ta.selectionStart;
			const end = ta.selectionEnd;
			ta.value = ta.value.slice(0, start) + '\t' + ta.value.slice(end);
			ta.selectionStart = ta.selectionEnd = start + 1;
			if (tab === 'interpreter') interpCode = ta.value;
			else transpileInput = ta.value;
		}
	}
</script>

<div class="flex h-[calc(100vh-57px)] flex-col overflow-y-auto">
	<!-- 탭 바 -->
	<div class="flex border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
		{#each (['interpreter', 'transpiler'] as Tab[]) as t}
			<button
				class="px-6 py-2 text-xs tracking-widest uppercase transition-colors
					{tab === t
					? 'border-b-2 border-primary text-primary'
					: 'text-base-content/40 hover:text-primary'}"
				onclick={() => (tab = t)}
			>
				{t}
			</button>
		{/each}
	</div>

	<!-- Interpreter -->
	{#if tab === 'interpreter'}
		<div class="flex flex-1 flex-col min-h-0">
			<div class="flex flex-1 flex-col border-b border-primary/20 min-h-0 overflow-hidden">
				<div
					class="flex items-center justify-between border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent px-4 py-1.5"
				>
					<span class="text-xs tracking-widest text-primary uppercase">Editor</span>
					<div class="flex items-center gap-3">
						<span class="text-xs text-base-content/30">Ctrl + Enter</span>
						<button
							class="btn btn-xs btn-primary gap-1.5 text-xs tracking-widest uppercase"
							onclick={handleRun}
						>
							▶ 실행
						</button>
					</div>
				</div>
				<textarea
					class="flex-1 resize-none bg-base-100 p-6 font-mono text-sm leading-relaxed text-base-content outline-none placeholder:text-base-content/20"
					bind:value={interpCode}
					onkeydown={handleKeydown}
					spellcheck={false}
					autocomplete="off"
					autocapitalize="off"
				></textarea>
			</div>
			<div class="flex flex-1 flex-col min-h-0 overflow-hidden">
				<div
					class="flex items-center justify-between border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent px-4 py-1.5"
				>
					<span class="text-xs tracking-widest text-primary uppercase">Output</span>
					{#if interpOutput}
						<button
							class="text-xs tracking-widest text-base-content/40 uppercase transition-colors hover:text-primary"
							onclick={() => copyToClipboard(interpOutput!, 'interp')}
						>
							{interpCopied ? '✓ copied' : 'copy'}
						</button>
					{/if}
				</div>
				<div class="relative flex-1 overflow-hidden bg-base-100">
					<img src={maaangImg} alt="" aria-hidden="true" class="pointer-events-none absolute inset-y-0 right-0 h-full w-auto object-contain opacity-20" />
					<div class="relative h-full overflow-auto p-6 font-mono text-sm leading-relaxed">
					{#if interpOutput === null}
						<p class="text-xs tracking-widest text-base-content/20 uppercase">
							— 실행 결과가 여기에 표시됩니다 —
						</p>
					{:else if interpOutput === ''}
						<p class="text-xs tracking-widest text-base-content/40 uppercase">— 출력 없음 —</p>
					{:else}
						<pre class="whitespace-pre-wrap text-base-content">{interpOutput}</pre>
					{/if}
					</div>
				</div>
			</div>
		</div>

	<!-- Transpiler -->
	{:else}
		<div class="flex flex-1 flex-col min-h-0">
			<div class="flex flex-1 flex-col border-b border-primary/20 min-h-0 overflow-hidden">
				<div
					class="flex items-center justify-between border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent px-4 py-1.5"
				>
					<span class="text-xs tracking-widest text-primary uppercase">Python</span>
					<div class="flex items-center gap-3">
						<span class="text-xs text-base-content/30">Ctrl + Enter</span>
						<button
							class="btn btn-xs btn-primary text-xs tracking-widest uppercase"
							onclick={handleTranspile}
						>
							▶ 변환
						</button>
					</div>
				</div>
				<textarea
					class="flex-1 resize-none bg-base-100 p-6 font-mono text-sm leading-relaxed text-base-content outline-none"
					bind:value={transpileInput}
					onkeydown={handleKeydown}
					spellcheck={false}
					autocomplete="off"
					autocapitalize="off"
				></textarea>
			</div>
			<div class="flex flex-1 flex-col min-h-0 overflow-hidden">
				<div
					class="flex items-center justify-between border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent px-4 py-1.5"
				>
					<span class="text-xs tracking-widest text-primary uppercase">maang</span>
					{#if transpileOutput}
						<button
							class="text-xs tracking-widest text-base-content/40 uppercase transition-colors hover:text-primary"
							onclick={() => copyToClipboard(transpileOutput!, 'transpile')}
						>
							{transpileCopied ? '✓ copied' : 'copy'}
						</button>
					{/if}
				</div>
				<div class="relative flex-1 overflow-hidden bg-base-100">
					<img src={maaangImg} alt="" aria-hidden="true" class="pointer-events-none absolute inset-y-0 right-0 h-full w-auto object-contain opacity-20" />
					<div class="relative h-full overflow-auto p-6 font-mono text-sm leading-relaxed">
					{#if transpileOutput === null}
						<p class="text-xs tracking-widest text-base-content/20 uppercase">
							— 변환 결과가 여기에 표시됩니다 —
						</p>
					{:else if transpileOutput === ''}
						<p class="text-xs tracking-widest text-base-content/40 uppercase">— 출력 없음 —</p>
					{:else}
						<pre class="whitespace-pre-wrap text-base-content">{transpileOutput}</pre>
					{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
