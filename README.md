# 마아앙 언어

## 0. 기본 원칙

프로그램은 토큰들의 연속이다. 공백은 무시된다.

토큰 형태: `BODY + SUFFIX?`

BODY:

- `망`
- `마(아)*앙`
- `자허`

SUFFIX: `(\.)*([!?])*` — dot 0개 이상, 그 뒤 `!`/`?` 0개 이상

주석: `#` 이후 같은 줄 끝까지 무시된다.

---

## 1. 숫자 토큰 (`망` / `마(아)*앙`)

`아` 개수 k → 값 k+1. `망` → 값 0.

### 1-1. suffix 없음 — push

| 토큰       | 값  |
| ---------- | --- |
| 망         | 0   |
| 마앙       | 1   |
| 마아앙     | 2   |
| 마아아앙   | 3   |
| 마(아×k)앙 | k+1 |

### 1-2. dot suffix — push << dot 개수

dot n개 → 값 << n (비트 시프트 좌, 즉 값 × 2ⁿ) 을 push.

| 예시              | 계산 | 결과 |
| ----------------- | ---- | ---- |
| 마아앙.           | 2<<1 | 4    |
| 마아앙..          | 2<<2 | 8    |
| 마아앙....        | 2<<4 | 32   |
| 마앙.....         | 1<<5 | 32   |
| 마아아아아앙..... | 5<<5 | 160  |

### 1-3. `!` suffix — 산술

이항 연산: pop b → pop a → push (a op b). 먼저 push한 값이 왼쪽 피연산자.

| 토큰            | 동작         |
| --------------- | ------------ |
| 망!             | add — a + b  |
| 마앙!           | sub — a - b  |
| 마아앙!         | mul — a × b  |
| 마아아앙!       | div — a ÷ b  |
| 마아아아앙!     | mod — a % b  |
| 마아아아아앙!   | shl — a << b |
| 마아아아아아앙! | pow — aᵇ     |

### 1-4. `?` suffix — 출력

| 토큰  | 동작                             |
| ----- | -------------------------------- |
| 망?   | top을 정수로 출력 (pop)          |
| 마앙? | top을 유니코드 문자로 출력 (pop) |

### 1-5. `!?` suffix — 제어 흐름

dot 개수 d가 레이블 **타입**을 결정한다. goto/if_false_jump는 **같은 dot 수**의 레이블만 찾는다.

| 토큰        | 동작                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| 망(d)!?     | label — dot d개짜리 레이블 표시 (런타임 no-op)                                     |
| 마앙(d)!?   | goto — 같은 dot 수(d)의 가장 가까운 **이전** 레이블로 점프                         |
| 마아앙(d)!? | if_false_jump — pop top; 0이면 같은 dot 수(d)의 가장 가까운 **다음** 레이블로 점프 |

예: `망!?` (d=0), `망.!?` (d=1), `망..!?` (d=2) — 서로 다른 타입이므로 중첩 제어 구조끼리 간섭하지 않는다.

---

## 2. `자허` 토큰 — 스택 / 메모리 조작

| 토큰    | 동작                                        |
| ------- | ------------------------------------------- |
| 자허    | pop — top 제거                              |
| 자허.   | load — pop addr → push mem[addr]            |
| 자허..  | store — pop addr, pop val → mem[addr] = val |
| 자허... | dup — top 복제                              |
| 자허!   | swap — top 두 개 교환                       |
| 자허?   | over — 두 번째 값을 top에 복사              |

---

## 3. 실행 모델

상태:

- 정수 스택
- 정수 메모리 배열
- 출력 스트림
- 프로그램 카운터

---

## 4. 제어 구조 패턴

각 제어 구조는 고유한 dot 수(타입 d)를 할당받아 서로 다른 레이블 타입을 사용한다.
아래 예시에서 `(d)`는 해당 구조의 dot 수 표기.

### while 루프

```text
망(d)!?           # loop start label
  (body)
마아앙(d)!?       # 항상 거짓(0) push → end label로 점프 (break)
마앙(d)!?         # goto loop start
망(d)!?           # loop end label
```

`while True:` 패턴 (무한 루프 + break):

```text
망(d)!?           # loop start label
  (body)
  ...
  망 마아앙(d)!?  # break: push 0 → if_false_jump to loop end
  ...
마앙(d)!?         # goto loop start
망(d)!?           # loop end label
```

### 카운터 루프 (for i in range(n)) — range(3) 예시

```text
망               # push 0  (i 초기화)
자허..           # store i
마아아앙         # push 3  (range 상한)
망(d)!?          # loop start label
  자허...        # dup 카운터
  마아앙(d)!?    # if 0, jump to loop end
  (body)         # 루프 바디 (i 로드/사용)
  마앙 마앙!     # 카운터 -= 1
  자허.          # load i
  마앙 망!       # i += 1
  자허..         # store i
마앙(d)!?        # goto loop start
망(d)!?          # loop end label
자허             # pop 0
```

### 중첩 루프

외부 루프 타입 d=0, 내부 루프 타입 d=1 — 서로 다른 dot 수라 레이블이 겹치지 않는다.

### if (else 없음)

```text
(조건값 push)
마아앙(d)!?      # 거짓이면 end label로 점프
  (body)
망(d)!?          # end label
```

### if / else

```text
(조건값 push)
자허...          # dup 조건값
마아앙(d)!?      # 거짓이면 else label로 점프
  (if body)
망(d)!?          # else label
(BOOL_NOT)       # 원래 조건이 참이면 0, 거짓이면 1
마아앙(d)!?      # 0이면(원래 참이면) end label로 점프
  (else body)
망(d)!?          # end label
```

BOOL_NOT: `자허... 자허... 마아앙! 마앙 망! 자허! 자허 마앙 자허! 마아아앙!`
→ x=0이면 1, x≠0이면 0 반환 (else body 진입 여부 결정)

### 카운터 루프 예시 — 3부터 1까지 출력 (d=0)

```text
마아아앙        # push 3
망!?            # label (loop start, d=0)
  자허...       # dup
  마아앙!?      # if 0, jump to loop end (d=0)
  자허...       # dup
  망?           # print number
  마앙!         # sub 1
마앙!?          # goto loop start (d=0)
망!?            # loop end label (d=0)
자허            # pop 0
```

출력: `321`

---

## 5. 파싱 예제

`마아앙마아아앙망!망?`

```text
마아앙      # push 2
마아아앙    # push 3
망!         # add → 5
망?         # print number
```

출력: `5`

---

## 6. 명령 전체 목록

### 숫자 토큰

- `망` / `마(아)*앙` — push 값
- dot n개 — push 값 << n (비트 시프트)

### 산술 (`!`)

- `망!` — add
- `마앙!` — sub
- `마아앙!` — mul
- `마아아앙!` — div
- `마아아아앙!` — mod
- `마아아아아앙!` — shl
- `마아아아아아앙!` — pow

### 출력 (`?`)

- `망?` — print number
- `마앙?` — print char

### 제어 (`!?`)

dot 수 d가 레이블 타입. 같은 d끼리만 매칭된다.

- `망(d)!?` — label (d = dot 개수)
- `마앙(d)!?` — goto (같은 d의 가장 가까운 이전 label)
- `마아앙(d)!?` — if_false_jump (같은 d의 가장 가까운 다음 label)

### 스택 / 메모리 (`자허`)

- `자허` — pop
- `자허.` — load
- `자허..` — store
- `자허...` — dup
- `자허!` — swap
- `자허?` — over

### 주석

- `# ...` — 줄 끝까지 무시

---

## 7. 한 줄 요약

`망`/`마(아)*앙`의 `아` 개수로 값을 표현하고, dot suffix로 비트 시프트 push, suffix(`!` `?` `!?`)로 산술·출력·제어를 수행하며, 제어 흐름은 dot 수가 레이블 타입으로 작동해 중첩 구조를 지원하고, `자허` 6종으로 스택·메모리를 조작하는 마아앙 스타일 스택 언어.
