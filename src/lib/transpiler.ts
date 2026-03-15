// ─── 숫자 → 토큰 ──────────────────────────────────────────────────────────────

const MAX_BODY = 5; // 마아아아아앙 (아 4개, 값 5) 초과 금지
const MAX_DOTS = 5; // dot 최대 5개

// 단일 토큰으로 표현 가능한 최대값 = MAX_BODY << MAX_DOTS = 5 << 5 = 160

function bestSingleToken(n: number): string | null {
	if (n === 0) return '망';
	if (n < 0) return null;

	let best: string | null = null;
	let bestLen = Infinity;

	// dots 없이: n ≤ MAX_BODY
	if (n >= 1 && n <= MAX_BODY) {
		const s = `마${'아'.repeat(n - 1)}앙`;
		if (s.length < bestLen) { bestLen = s.length; best = s; }
	}

	// dots 있음: body << dots = n → body = n >> dots, n 이 2^dots 의 배수여야 함
	for (let d = 1; d <= MAX_DOTS; d++) {
		if ((n & ((1 << d) - 1)) !== 0) continue; // 2^d 의 배수가 아님
		const body = n >> d;
		if (body >= 1 && body <= MAX_BODY) {
			const s = `마${'아'.repeat(body - 1)}앙${'.' .repeat(d)}`;
			if (s.length < bestLen) { bestLen = s.length; best = s; }
		}
	}

	return best;
}

// 토큰 개수 측정 (비용 함수)
function tokenCount(s: string): number {
	return s.trim() === '' ? 0 : s.trim().split(/\s+/).length;
}

// 덧셈/곱셈 혼합 분해: 반복되는 청크는 곱셈으로 묶어 토큰 수 절감
function pushNumberAdditive(n: number): string {
	const segments: string[] = [];
	let rem = n;
	while (rem > 0) {
		// 현재 rem 이하의 가장 큰 단일 토큰 값 탐색
		let chunk = 0;
		let chunkToken = '';
		for (let a = Math.min(rem, MAX_BODY << MAX_DOTS); a >= 1; a--) {
			const t = bestSingleToken(a);
			if (t) { chunk = a; chunkToken = t; break; }
		}
		const count = Math.floor(rem / chunk);
		if (count > 1) {
			// 반복 청크를 곱셈으로 표현: chunk × count
			const countStr = pushNumber(count);
			segments.push(`${chunkToken} ${countStr} 마아앙!`);
		} else {
			segments.push(chunkToken);
		}
		rem -= chunk * count;
	}
	if (segments.length === 1) return segments[0];
	let s = segments[0];
	for (let i = 1; i < segments.length; i++) s += ` ${segments[i]} 망!`;
	return s;
}

const numCache = new Map<number, string>();

function pushNumber(n: number): string {
	if (n === 0) return '망';
	if (n < 0) return `망 ${pushNumber(-n)} 마앙!`;
	if (numCache.has(n)) return numCache.get(n)!;

	// 단일 토큰
	const single = bestSingleToken(n);
	if (single) { numCache.set(n, single); return single; }

	// 덧셈 분해 (항상 가능한 fallback)
	let best = pushNumberAdditive(n);
	let bestCost = tokenCount(best);

	// 곱셈 분해: n = a * b → 더 짧으면 채택
	const sqrtN = Math.floor(Math.sqrt(n));
	for (let a = 2; a <= sqrtN; a++) {
		if (n % a === 0) {
			const b = n / a;
			const sa = pushNumber(a);
			const sb = pushNumber(b);
			const candidate = `${sa} ${sb} 마아앙!`;
			const cost = tokenCount(candidate);
			if (cost < bestCost) { bestCost = cost; best = candidate; }
		}
	}

	// 거듭제곱 분해: n = base^exp → 더 짧으면 채택
	for (let exp = 2; exp <= 20; exp++) {
		const approx = Math.round(Math.pow(n, 1 / exp));
		for (const base of [approx - 1, approx, approx + 1]) {
			if (base >= 2) {
				let p = 1;
				let overflow = false;
				for (let i = 0; i < exp; i++) {
					p *= base;
					if (p > n) { overflow = true; break; }
				}
				if (!overflow && p === n) {
					const sb = pushNumber(base);
					const se = pushNumber(exp);
					const candidate = `${sb} ${se} 마아아아아아앙!`;
					const cost = tokenCount(candidate);
					if (cost < bestCost) { bestCost = cost; best = candidate; }
				}
			}
		}
	}

	// 뺄셈 분해: n = c - delta (c, delta 둘 다 단일 토큰) → cost 항상 3
	if (bestCost > 3) {
		for (let delta = 1; delta <= MAX_BODY << MAX_DOTS; delta++) {
			const deltaToken = bestSingleToken(delta);
			if (!deltaToken) continue;
			const cToken = bestSingleToken(n + delta);
			if (cToken) {
				bestCost = 3;
				best = `${cToken} ${deltaToken} 마앙!`;
				break;
			}
		}
	}

	numCache.set(n, best);
	return best;
}

// ─── 표현식 파서 ───────────────────────────────────────────────────────────────

type VarEnv = { vars: Map<string, number>; nextAddr: number; strings: Map<string, string> };

function allocVar(env: VarEnv, name: string): number {
	if (!env.vars.has(name)) env.vars.set(name, env.nextAddr++);
	return env.vars.get(name)!;
}

function loadVar(env: VarEnv, name: string): string[] {
	const addr = env.vars.get(name);
	if (addr === undefined) return [`# 미정의 변수: ${name}`];
	return [pushNumber(addr), '자허.'];
}

function storeVar(env: VarEnv, name: string): string {
	return `${pushNumber(allocVar(env, name))} 자허..`;
}

class ExprParser {
	private pos = 0;
	constructor(private input: string, private env: VarEnv = { vars: new Map(), nextAddr: 0, strings: new Map() }) {
		this.input = input.trim();
	}

	parse(): string[] {
		const result = this.parseAddSub();
		return result;
	}

	private skipWs() {
		while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) this.pos++;
	}

	private parseAddSub(): string[] {
		let left = this.parseMulDiv();
		while (true) {
			this.skipWs();
			if (this.input[this.pos] === '+') {
				this.pos++;
				left = [...left, ...this.parseMulDiv(), '망!'];
			} else if (this.input[this.pos] === '-') {
				this.pos++;
				left = [...left, ...this.parseMulDiv(), '마앙!'];
			} else break;
		}
		return left;
	}

	private parseMulDiv(): string[] {
		let left = this.parseUnary();
		while (true) {
			this.skipWs();
			if (this.input.slice(this.pos, this.pos + 2) === '//') {
				this.pos += 2;
				left = [...left, ...this.parseUnary(), '마아아앙!'];
			} else if (this.input[this.pos] === '*') {
				this.pos++;
				left = [...left, ...this.parseUnary(), '마아앙!'];
			} else if (this.input[this.pos] === '%') {
				this.pos++;
				left = [...left, ...this.parseUnary(), '마아아아앙!'];
			} else break;
		}
		return left;
	}

	private parseUnary(): string[] {
		this.skipWs();
		if (this.input[this.pos] === '-') {
			this.pos++;
			const val = this.parseAtom();
			return ['망', ...val, '마앙!']; // 0 - val
		}
		return this.parseAtom();
	}

	private parseAtom(): string[] {
		this.skipWs();
		// 괄호
		if (this.input[this.pos] === '(') {
			this.pos++;
			const inner = this.parseAddSub();
			this.skipWs();
			if (this.input[this.pos] === ')') this.pos++;
			return inner;
		}
		// 정수 리터럴
		const numMatch = this.input.slice(this.pos).match(/^\d+/);
		if (numMatch) {
			this.pos += numMatch[0].length;
			return [pushNumber(parseInt(numMatch[0]))];
		}
		// 식별자 (변수)
		const idMatch = this.input.slice(this.pos).match(/^[a-zA-Z_]\w*/);
		if (idMatch) {
			this.pos += idMatch[0].length;
			return loadVar(this.env, idMatch[0]);
		}
		return [];
	}
}

function transpileExpr(expr: string, env: VarEnv): string[] {
	return new ExprParser(expr, env).parse();
}

// ─── print 처리 ───────────────────────────────────────────────────────────────

function transpilePrint(arg: string, out: string[], env: VarEnv) {
	// 문자열 변수
	const strVar = env.strings.get(arg.trim());
	if (strVar !== undefined) {
		transpilePrint(`"${strVar.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`, out, env);
		return;
	}

	// chr(expr)
	const chrMatch = arg.match(/^chr\((.+)\)$/);
	if (chrMatch) {
		const tokens = transpileExpr(chrMatch[1], env);
		out.push(tokens.join(' ') + ' 마앙?');
		return;
	}

	// 문자열 리터럴
	const strMatch = arg.match(/^(['"])(.*)\1$/);
	if (strMatch) {
		const str = strMatch[2]
			.replace(/\\n/g, '\n')
			.replace(/\\t/g, '\t')
			.replace(/\\\\/g, '\\');
		const chars = [...str];
		const codepoints = chars.map(ch => ch.codePointAt(0)!);

		let prevCpOnStack = false;
		let prevCp = 0;

		for (let i = 0; i < codepoints.length; i++) {
			const cp = codepoints[i];
			const isLast = i === codepoints.length - 1;

			if (prevCpOnStack) {
				const delta = cp - prevCp;
				const deltaCost = tokenCount(pushNumber(Math.abs(delta)));
				const directCost = tokenCount(pushNumber(cp));

				if (deltaCost < directCost) {
					const deltaStr = pushNumber(Math.abs(delta));
					const op = delta >= 0 ? '망!' : '마앙!';
					if (isLast) {
						out.push(`${deltaStr} ${op} 마앙?`);
						prevCpOnStack = false;
					} else {
						out.push(`${deltaStr} ${op} 자허... 마앙?`);
					}
					prevCp = cp;
					continue;
				}
				out.push('자허');
				prevCpOnStack = false;
			}

			if (isLast) {
				out.push(`${pushNumber(cp)} 마앙?`);
			} else {
				out.push(`${pushNumber(cp)} 자허... 마앙?`);
				prevCpOnStack = true;
			}
			prevCp = cp;
		}
		return;
	}

	// 수식
	const tokens = transpileExpr(arg, env);
	out.push(tokens.join(' ') + ' 망?');
}

// ─── 블록 트랜스파일 ──────────────────────────────────────────────────────────

function getIndent(line: string): number {
	return line.match(/^(\s*)/)?.[1].length ?? 0;
}

type LoopType = 'for' | 'while' | null;

function transpileBlock(lines: string[], out: string[], start: number, parentIndent: number, loopType: LoopType = null, env: VarEnv = { vars: new Map(), nextAddr: 0, strings: new Map() }): number {
	let i = start;
	while (i < lines.length) {
		const raw = lines[i];
		const stripped = raw.replace(/#.*$/, '');
		const trimmed = stripped.trim();

		if (!trimmed) { i++; continue; }

		const indent = getIndent(stripped);
		if (indent <= parentIndent) break;

		i = transpileStatement(lines, out, i, trimmed, indent, loopType, env);
	}
	return i;
}

function transpileStatement(
	lines: string[],
	out: string[],
	i: number,
	trimmed: string,
	indent: number,
	loopType: LoopType = null,
	env: VarEnv = { vars: new Map(), nextAddr: 0, strings: new Map() }
): number {
	// print(...)
	const printMatch = trimmed.match(/^print\((.+)\)$/s);
	if (printMatch) {
		transpilePrint(printMatch[1].trim(), out, env);
		return i + 1;
	}

	// 변수 대입: name = expr  (신규 및 재대입 모두 처리)
	const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
	if (assignMatch) {
		const name = assignMatch[1];
		const rhs = assignMatch[2].trim();
		// 문자열 리터럴이면 strings 맵에 저장 (런타임 메모리 불필요)
		const strLiteral = rhs.match(/^(['"])(.*)\1$/s);
		if (strLiteral) {
			env.strings.set(name, strLiteral[2].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\'));
			return i + 1;
		}
		const exprTokens = transpileExpr(rhs, env);
		allocVar(env, name);
		out.push(exprTokens.join(' ') + ' ' + storeVar(env, name));
		return i + 1;
	}

	// break
	if (trimmed === 'break') {
		if (loopType === 'for') out.push('자허'); // 루프 카운터 pop
		out.push('망 마아앙!?');
		return i + 1;
	}

	// for var in range(n):
	const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\((.+?)\)\s*:$/);
	if (forMatch) {
		const varName = forMatch[1];
		const rangeTokens = transpileExpr(forMatch[2].trim(), env);
		allocVar(env, varName);
		// i = 0 초기화
		out.push('망 ' + storeVar(env, varName));
		// 루프 카운터 push
		out.push(rangeTokens.join(' '));
		out.push('망!?');
		out.push('자허...');
		out.push('마아앙!?');
		// 바디 (var 사용 가능)
		const afterBody = transpileBlock(lines, out, i + 1, indent, 'for', env);
		// 카운터 감소 및 var 증가
		out.push('마앙 마앙!');
		out.push(loadVar(env, varName).join(' ') + ' 마앙 망! ' + storeVar(env, varName));
		out.push('마앙!?');
		out.push('망!?');
		out.push('자허');
		return afterBody;
	}

	// while True:
	if (trimmed === 'while True:') {
		out.push('망!?');
		const afterBody = transpileBlock(lines, out, i + 1, indent, 'while', env);
		out.push('마앙!?');
		out.push('망!?');
		return afterBody;
	}

	// 미지원
	out.push(`# 미지원: ${trimmed}`);
	return i + 1;
}

// ─── 진입점 ───────────────────────────────────────────────────────────────────

export function transpile(code: string): string {
	const lines = code.split('\n');
	const out: string[] = [];
	transpileBlock(lines, out, 0, -1, null, { vars: new Map(), nextAddr: 0, strings: new Map() });
	return out.join('\n');
}
