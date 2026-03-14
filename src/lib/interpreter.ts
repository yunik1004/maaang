/**
 * maang 언어 인터프리터
 * TODO: 언어 구현을 여기에 추가하세요
 */
export function run(code: string): string {
	// 빈 코드 처리
	const lines = code.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
	if (lines.length === 0) return '';

	// 아직 구현되지 않음
	return '(인터프리터가 아직 구현되지 않았습니다)';
}
