import { describe, it, expect } from 'vitest';
import { transpile } from '../src/lib/transpiler';
import { run } from '../src/lib/interpreter';

function exec(python: string): string {
	return run(transpile(python));
}

// ─── print ────────────────────────────────────────────────────────────────────

describe('print', () => {
	it('문자열 리터럴', () => expect(exec('print("hello")')).toBe('hello'));
	it('빈 문자열', () => expect(exec('print("")')).toBe(''));
	it('줄바꿈 이스케이프', () => expect(exec('print("a\\nb")')).toBe('a\nb'));
	it('탭 이스케이프', () => expect(exec('print("a\\tb")')).toBe('a\tb'));
	it('백슬래시 이스케이프', () => expect(exec('print("a\\\\b")')).toBe('a\\b'));
	it('한글 문자열', () => expect(exec('print("마아앙")')).toBe('마아앙'));
	it('chr(65) → A', () => expect(exec('print(chr(65))')).toBe('A'));
	it('chr(44032) → 가', () => expect(exec('print(chr(44032))')).toBe('가'));
	it('숫자 수식 출력', () => expect(exec('print(1 + 2)')).toBe('3'));
	it('복합 수식: 1 + 2 * 3 = 7', () => expect(exec('print(1 + 2 * 3)')).toBe('7'));
	it('괄호 수식: (1 + 2) * 3 = 9', () => expect(exec('print((1 + 2) * 3)')).toBe('9'));
	it('정수 나눗셈: 7 // 2 = 3', () => expect(exec('print(7 // 2)')).toBe('3'));
	it('나머지: 7 % 3 = 1', () => expect(exec('print(7 % 3)')).toBe('1'));
	it('단항 음수: -5', () => expect(exec('print(-5)')).toBe('-5'));
	it('연속 출력', () => expect(exec('print("a")\nprint("b")\nprint("c")')).toBe('abc'));
});

// ─── 변수 ─────────────────────────────────────────────────────────────────────

describe('변수', () => {
	it('정수 변수 대입 및 출력', () => expect(exec('x = 10\nprint(x)')).toBe('10'));
	it('변수 재대입', () => expect(exec('x = 3\nx = 5\nprint(x)')).toBe('5'));
	it('변수 산술 재대입', () => expect(exec('x = 3\nx = x + 2\nprint(x)')).toBe('5'));
	it('여러 변수', () => expect(exec('a = 3\nb = 4\nprint(a)\nprint(b)')).toBe('34'));
	it('변수끼리 연산', () => expect(exec('a = 3\nb = 4\nprint(a + b)')).toBe('7'));
	it('문자열 변수', () => expect(exec('msg = "hi"\nprint(msg)')).toBe('hi'));
	it('문자열 변수 재대입', () => expect(exec('s = "a"\ns = "b"\nprint(s)')).toBe('b'));
});

// ─── for 루프 ─────────────────────────────────────────────────────────────────

describe('for 루프', () => {
	it('range(0) → 출력 없음', () => expect(exec('for i in range(0):\n  print(i)')).toBe(''));
	it('range(1) → 0', () => expect(exec('for i in range(1):\n  print(i)')).toBe('0'));
	it('range(3) → 012', () => expect(exec('for i in range(3):\n  print(i)')).toBe('012'));
	it('range(5) → 01234', () => expect(exec('for i in range(5):\n  print(i)')).toBe('01234'));
	it('루프 내 연산', () => expect(exec('for i in range(3):\n  print(i * 2)')).toBe('024'));
	it('루프 내 누적', () => {
		expect(exec('s = 0\nfor i in range(4):\n  s = s + i\nprint(s)')).toBe('6');
	});
	it('range(expr)', () => expect(exec('n = 4\nfor i in range(n):\n  print(i)')).toBe('0123'));
	it('break로 조기 종료', () => {
		expect(exec('for i in range(5):\n  print(i)\n  break')).toBe('0');
	});
	it('중첩 for: 삼각형 별', () => {
		// for i in range(3): for j in range(i): print("*") → ** (0+1+2개)
		expect(exec('for i in range(3):\n  for j in range(i):\n    print("*")')).toBe('***');
	});
	it('중첩 for: 구구단 일부', () => {
		// 2단 2~4: 4 6 8
		expect(exec('for i in range(3):\n  print((i + 2) * 2)')).toBe('468');
	});
});

// ─── while 루프 ───────────────────────────────────────────────────────────────

describe('while 루프', () => {
	it('즉시 break', () => expect(exec('while True:\n  break')).toBe(''));
	it('카운터 감소 후 break', () => {
		expect(exec('n = 3\nwhile True:\n  print(n)\n  n = n - 1\n  break')).toBe('3');
	});
});

// ─── if (else 없음) ───────────────────────────────────────────────────────────

describe('if (else 없음)', () => {
	it('truthy → 바디 실행', () => expect(exec('x = 5\nif x:\n  print(1)')).toBe('1'));
	it('falsy (0) → 바디 건너뜀', () => expect(exec('x = 0\nif x:\n  print(1)')).toBe(''));
	it('if 이후 코드 정상 실행', () => {
		expect(exec('x = 0\nif x:\n  print(1)\nprint(2)')).toBe('2');
	});
	it('if a != b: 참', () => {
		expect(exec('a = 3\nb = 5\nif a != b:\n  print(1)')).toBe('1');
	});
	it('if a != b: 거짓', () => {
		expect(exec('a = 5\nb = 5\nif a != b:\n  print(1)')).toBe('');
	});
	it('if a == b: 참', () => {
		expect(exec('a = 5\nb = 5\nif a == b:\n  print(1)')).toBe('1');
	});
	it('if a == b: 거짓', () => {
		expect(exec('a = 3\nb = 5\nif a == b:\n  print(1)')).toBe('');
	});
});

// ─── if / else ────────────────────────────────────────────────────────────────

describe('if / else', () => {
	it('truthy → if 바디', () => {
		expect(exec('x = 1\nif x:\n  print(1)\nelse:\n  print(0)')).toBe('1');
	});
	it('falsy → else 바디', () => {
		expect(exec('x = 0\nif x:\n  print(1)\nelse:\n  print(0)')).toBe('0');
	});
	it('if a == b: 참 → if 바디', () => {
		expect(exec('a = 8\nb = 8\nif a == b:\n  print(1)\nelse:\n  print(0)')).toBe('1');
	});
	it('if a == b: 거짓 → else 바디', () => {
		expect(exec('a = 3\nb = 8\nif a == b:\n  print(1)\nelse:\n  print(0)')).toBe('0');
	});
	it('if a != b: 참 → if 바디', () => {
		expect(exec('a = 3\nb = 8\nif a != b:\n  print(1)\nelse:\n  print(0)')).toBe('1');
	});
	it('if a != b: 거짓 → else 바디', () => {
		expect(exec('a = 8\nb = 8\nif a != b:\n  print(1)\nelse:\n  print(0)')).toBe('0');
	});
	it('수식 조건 (3 + 5 == 8)', () => {
		expect(exec('a = 3 + 5\nif a == 8:\n  print("마아앙")\nelse:\n  print("으아앙")')).toBe(
			'마아앙'
		);
	});
	it('수식 조건 (3 + 5 != 8) → else', () => {
		expect(exec('a = 3 + 6\nif a == 8:\n  print("마아앙")\nelse:\n  print("으아앙")')).toBe(
			'으아앙'
		);
	});
	it('else 이후 코드 정상 실행', () => {
		expect(exec('x = 0\nif x:\n  print(1)\nelse:\n  print(2)\nprint(3)')).toBe('23');
	});
});

// ─── 미지원 문법 ──────────────────────────────────────────────────────────────

describe('미지원 문법', () => {
	// 미지원 구문은 `# 미지원: ...` 주석으로 변환됨.
	// transpile 결과는 토큰을 공백으로 join한 한 줄이므로
	// 주석 이후 토큰도 같은 줄로 인식되어 모두 무시됨.
	it('미지원 구문 이전 코드는 정상 실행', () => {
		expect(exec('print(1)\nfoo bar')).toBe('1');
	});
});
