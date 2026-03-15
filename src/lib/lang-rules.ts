type Rule = { kind: 'rule'; title: string; example: string };
type Section = { kind: 'section'; title: string };
export type Entry = Rule | Section;

export const interpRules: Entry[] = [
	{ kind: 'section', title: 'push' },
	{ kind: 'rule', title: 'push 0', example: '망' },
	{ kind: 'rule', title: 'push n  (아 개수 + 1)', example: '마앙 → 1 │ 마아앙 → 2' },
	{ kind: 'rule', title: 'push n << dot 수', example: '마아앙.... → 32  (2 << 4)' },

	{ kind: 'section', title: '산술' },
	{ kind: 'rule', title: 'add', example: '망!' },
	{ kind: 'rule', title: 'sub', example: '마앙!' },
	{ kind: 'rule', title: 'mul', example: '마아앙!' },
	{ kind: 'rule', title: 'div', example: '마아아앙!' },
	{ kind: 'rule', title: 'mod', example: '마아아아앙!' },
	{ kind: 'rule', title: 'shl  (a << b)', example: '마아아아아앙!' },
	{ kind: 'rule', title: 'pow  (aᵇ)', example: '마아아아아아앙!' },

	{ kind: 'section', title: '출력' },
	{ kind: 'rule', title: 'print number', example: '망?' },
	{ kind: 'rule', title: 'print char (unicode)', example: '마앙?' },

	{ kind: 'section', title: '제어 흐름' },
	{ kind: 'rule', title: 'label', example: '망!?' },
	{ kind: 'rule', title: 'goto  (가장 가까운 이전 label)', example: '마앙!?' },
	{ kind: 'rule', title: 'if 0, jump  (가장 가까운 다음 label)', example: '마아앙!?' },

	{ kind: 'section', title: '스택 / 메모리' },
	{ kind: 'rule', title: 'pop', example: '자허' },
	{ kind: 'rule', title: 'dup', example: '자허...' },
	{ kind: 'rule', title: 'swap', example: '자허!' },
	{ kind: 'rule', title: 'over', example: '자허?' },
	{ kind: 'rule', title: 'load  (pop addr → push mem[addr])', example: '자허.' },
	{ kind: 'rule', title: 'store  (pop addr, pop val → mem[addr]=val)', example: '자허..' },

	{ kind: 'section', title: '주석' },
	{ kind: 'rule', title: 'comment', example: '# 이건 주석' },
];

export const transpilerRules: Entry[] = [
	{ kind: 'section', title: '지원 Python 문법' },
	{ kind: 'rule', title: '문자열 출력', example: 'print("hello")' },
	{ kind: 'rule', title: '유니코드 문자 출력', example: 'print(chr(44032))' },
	{ kind: 'rule', title: '수식 출력  (+  -  *  //  %)', example: 'print(1 + 2 * 3)' },
	{ kind: 'rule', title: '변수 대입 / 재대입', example: 'x = 10\nx = x + 1' },
	{ kind: 'rule', title: '문자열 변수', example: 'msg = "hi"\nprint(msg)' },
	{ kind: 'rule', title: 'for 루프', example: 'for i in range(5):\n  print(i)' },
	{ kind: 'rule', title: 'while 루프', example: 'while True:\n  ...' },
	{ kind: 'rule', title: 'break', example: 'while True:\n  break' },
];
