import { createToken, Lexer } from 'chevrotain';

// ─── Lexer ────────────────────────────────────────────────────────────────────

const Comment = createToken({
	name: 'Comment',
	pattern: /#[^\n]*/,
	group: Lexer.SKIPPED
});

const Whitespace = createToken({
	name: 'Whitespace',
	pattern: /\s+/,
	group: Lexer.SKIPPED
});

// 토큰: (망 | 마아*앙 | 자허) (\.)*  ([!?])*
const Token = createToken({
	name: 'Token',
	pattern: /(?:망|마아*앙|자허)\.*[!?]*/
});

const maangLexer = new Lexer([Comment, Whitespace, Token]);

// ─── 토큰 파싱 ────────────────────────────────────────────────────────────────

interface Instruction {
	body: 'jaheo' | 'number';
	value: number; // 망=0, 마앙=1, 마아앙=2, ... / 자허는 사용 안 함
	dots: number;
	suffix: string; // '', '!', '?', '!?', ...
}

function parseImage(image: string): Instruction {
	let pos = 0;
	let body: 'jaheo' | 'number';
	let value = 0;

	if (image[0] === '자') {
		// 자허 (2글자)
		body = 'jaheo';
		pos = 2;
	} else if (image[0] === '망') {
		body = 'number';
		value = 0;
		pos = 1;
	} else {
		// 마(아*)앙
		body = 'number';
		pos = 1; // '마' 건너뜀
		let aCount = 0;
		while (pos < image.length && image[pos] === '아') {
			aCount++;
			pos++;
		}
		pos++; // '앙' 건너뜀
		value = aCount + 1;
	}

	let dots = 0;
	while (pos < image.length && image[pos] === '.') {
		dots++;
		pos++;
	}

	const suffix = image.slice(pos);
	return { body, value, dots, suffix };
}

// ─── 제어 흐름 사전 계산 ──────────────────────────────────────────────────────

function isLabel(inst: Instruction) {
	return inst.body === 'number' && inst.value === 0 && inst.dots === 0 && inst.suffix === '!?';
}

function buildJumpMap(instructions: Instruction[]) {
	// goto(마앙!?) → 가장 가까운 이전 망!? 위치
	const gotoTargets = new Map<number, number>();
	// if_false_jump(마아앙!?) → 가장 가까운 다음 망!? 위치
	const ifFalseTargets = new Map<number, number>();

	for (let i = 0; i < instructions.length; i++) {
		const inst = instructions[i];
		if (inst.body !== 'number' || inst.dots !== 0 || inst.suffix !== '!?') continue;

		if (inst.value === 1) {
			// 마앙!? (goto): 이전 레이블 탐색
			for (let j = i - 1; j >= 0; j--) {
				if (isLabel(instructions[j])) {
					gotoTargets.set(i, j);
					break;
				}
			}
		} else if (inst.value === 2) {
			// 마아앙!? (if_false_jump): 다음 레이블 탐색
			for (let j = i + 1; j < instructions.length; j++) {
				if (isLabel(instructions[j])) {
					ifFalseTargets.set(i, j);
					break;
				}
			}
		}
	}

	return { gotoTargets, ifFalseTargets };
}

// ─── 실행 ─────────────────────────────────────────────────────────────────────

const MAX_STEPS = 1_000_000;

export function run(code: string): string {
	const lexResult = maangLexer.tokenize(code);

	if (lexResult.errors.length > 0) {
		return `오류: ${lexResult.errors[0].message}`;
	}

	const instructions = lexResult.tokens.map((t) => parseImage(t.image));
	const { gotoTargets, ifFalseTargets } = buildJumpMap(instructions);

	const stack: number[] = [];
	const memory: number[] = [];
	const output: string[] = [];
	let pc = 0;
	let steps = 0;

	while (pc < instructions.length) {
		if (++steps > MAX_STEPS) {
			return output.join('') + '\n(실행 한도 초과)';
		}

		const { body, value, dots, suffix } = instructions[pc];

		// ── 자허: 스택 조작 ──────────────────────────────────────────────────
		if (body === 'jaheo') {
			if (dots === 0 && suffix === '') {
				// 자허: pop
				stack.pop();
			} else if (dots === 1 && suffix === '') {
				// 자허.: load — pop addr, push memory[addr]
				if (stack.length > 0) {
					const addr = stack.pop()!;
					stack.push(memory[addr] ?? 0);
				}
			} else if (dots === 2 && suffix === '') {
				// 자허..: store — pop addr, pop value, memory[addr] = value
				if (stack.length >= 2) {
					const addr = stack.pop()!;
					const val = stack.pop()!;
					memory[addr] = val;
				}
			} else if (dots === 3 && suffix === '') {
				// 자허...: dup
				if (stack.length > 0) stack.push(stack[stack.length - 1]);
			} else if (dots === 0 && suffix === '!') {
				// 자허!: swap
				if (stack.length >= 2) {
					const a = stack.pop()!;
					const b = stack.pop()!;
					stack.push(a);
					stack.push(b);
				}
			} else if (dots === 0 && suffix === '?') {
				// 자허?: over
				if (stack.length >= 2) stack.push(stack[stack.length - 2]);
			}
			pc++;
			continue;
		}

		// ── 숫자 토큰 ────────────────────────────────────────────────────────

		// dot suffix: push value << dots
		if (dots > 0) {
			if (suffix === '') stack.push(value << dots);
			// dots + 다른 suffix 조합은 미정의 → 무시
			pc++;
			continue;
		}

		// suffix 없음: push value
		if (suffix === '') {
			stack.push(value);
			pc++;
			continue;
		}

		// ! suffix: 산술
		if (suffix === '!') {
			if (stack.length >= 2) {
				const b = stack.pop()!;
				const a = stack.pop()!;
				switch (value) {
					case 0:
						stack.push(a + b);
						break; // 망!  add
					case 1:
						stack.push(a - b);
						break; // 마앙!  sub
					case 2:
						stack.push(a * b);
						break; // 마아앙!  mul
					case 3:
						stack.push(b !== 0 ? Math.trunc(a / b) : 0);
						break; // 마아아앙!  div
					case 4:
						stack.push(b !== 0 ? ((a % b) + b) % b : 0);
						break; // 마아아아앙!  mod
					case 5:
						stack.push(a << b);
						break; // 마아아아아앙!  shl
					case 6: {
						// 마아아아아아앙!  pow
						let r = 1;
						for (let i = 0; i < b; i++) r *= a;
						stack.push(r);
						break;
					}
				}
			}
			pc++;
			continue;
		}

		// ? suffix: 출력
		if (suffix === '?') {
			if (stack.length > 0) {
				const top = stack.pop()!;
				switch (value) {
					case 0:
						output.push(String(top));
						break; // 망?  print number
					case 1: {
						// 마앙?  print char
						try {
							output.push(String.fromCodePoint(top));
						} catch {
							output.push('?');
						}
						break;
					}
				}
			}
			pc++;
			continue;
		}

		// !? suffix: 제어 흐름
		if (suffix === '!?') {
			switch (value) {
				case 0: {
					// 망!?: label (런타임 no-op)
					pc++;
					break;
				}
				case 1: {
					// 마앙!?: goto → 가장 가까운 이전 레이블로 점프
					const target = gotoTargets.get(pc);
					pc = target !== undefined ? target : pc + 1;
					break;
				}
				case 2: {
					// 마아앙!?: if_false_jump → top이 0이면 다음 레이블로 점프
					const top = stack.length > 0 ? stack.pop()! : 0;
					if (top === 0) {
						const target = ifFalseTargets.get(pc);
						pc = target !== undefined ? target : pc + 1;
					} else {
						pc++;
					}
					break;
				}
				default:
					pc++;
			}
			continue;
		}

		// 미정의 suffix: 무시
		pc++;
	}

	return output.join('');
}
