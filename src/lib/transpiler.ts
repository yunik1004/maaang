/**
 * Python → maang 트랜스파일러
 * TODO: 변환 로직을 여기에 구현하세요
 */
export function transpile(code: string): string {
	const lines = code.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
	if (lines.length === 0) return '';

	return '(트랜스파일러가 아직 구현되지 않았습니다)';
}
