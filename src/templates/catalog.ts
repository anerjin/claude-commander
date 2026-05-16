import { Template } from "./types";

interface BuiltinTemplate {
  id: string;
  name: string;
  description: string;
  body: string;
  tags?: string[];
}

const BUILTIN: BuiltinTemplate[] = [
  {
    id: "review-selection",
    name: "선택 영역 코드 리뷰",
    description: "현재 선택한 코드를 리뷰. 버그 / 보안 / 가독성 / 성능 관점.",
    tags: ["review", "selection"],
    body:
`아래 코드를 리뷰해줘. 다음 관점을 모두 짚어줘.
1. 버그/논리 오류
2. 보안 이슈
3. 가독성 / 네이밍
4. 성능

파일: {{file}} (라인 {{lineRange}})

\`\`\`
{{selection}}
\`\`\``,
  },
  {
    id: "explain-selection",
    name: "선택 영역 한국어로 설명",
    description: "선택 코드가 어떻게 동작하는지 한 줄씩 풀어서 설명.",
    tags: ["explain", "selection"],
    body:
`아래 코드를 한국어로 설명해줘. 줄 단위로 풀어서.

파일: {{file}}

\`\`\`
{{selection}}
\`\`\``,
  },
  {
    id: "refactor-selection",
    name: "선택 영역 리팩토링 제안",
    description: "함수 분리 / 네이밍 개선 / 중복 제거 등 구체적 제안.",
    tags: ["refactor", "selection"],
    body:
`아래 코드를 리팩토링해줘. 동작은 그대로 유지하면서 가독성과 유지보수성을 개선.
변경 이유도 같이 설명해줘.

\`\`\`
{{selection}}
\`\`\``,
  },
  {
    id: "test-selection",
    name: "선택 영역 단위 테스트 작성",
    description: "정상 경로 + 엣지 케이스를 포함한 테스트 코드 생성.",
    tags: ["test", "selection"],
    body:
`아래 코드의 단위 테스트를 작성해줘. 정상 경로 + 엣지 케이스 + 에러 케이스.
프로젝트의 기존 테스트 스타일을 따라줘.

\`\`\`
{{selection}}
\`\`\``,
  },
  {
    id: "commit-message",
    name: "커밋 메시지 작성",
    description: "현재 staged 변경사항으로 Conventional Commits 메시지 작성.",
    tags: ["git", "commit"],
    body:
`아래 staged diff 를 보고 Conventional Commits 형식의 커밋 메시지를 한국어로 작성해줘.
제목은 50자 이내. 본문은 무엇/왜를 설명. 깃 명령은 만들지 말고 메시지 텍스트만.

브랜치: {{branch}}

\`\`\`diff
{{gitDiffStaged}}
\`\`\``,
  },
  {
    id: "pr-description",
    name: "PR 설명 작성",
    description: "이번 브랜치 변경사항으로 PR 본문 (요약 + 테스트 계획) 작성.",
    tags: ["git", "pr"],
    body:
`현재 브랜치(\`{{branch}}\`)의 변경사항으로 Pull Request 본문을 한국어로 작성해줘.

다음 섹션을 포함:
- ## 요약 (3-5줄 bullet)
- ## 변경 사항 (파일별로)
- ## 테스트 계획 (체크박스 markdown)

\`\`\`diff
{{gitDiff}}
\`\`\``,
  },
  {
    id: "explain-diff",
    name: "현재 변경사항 요약",
    description: "워킹 트리의 변경을 한 문단으로 요약.",
    tags: ["git"],
    body:
`아래는 \`{{branch}}\` 브랜치의 현재 워킹 트리 변경사항입니다.
한 문단으로 무엇이/왜 바뀌었는지 한국어로 요약해줘.

\`\`\`diff
{{gitDiff}}
\`\`\``,
  },
  {
    id: "find-bug",
    name: "버그 사냥",
    description: "선택 코드에서 가장 가능성 높은 버그 후보 3가지를 추정.",
    tags: ["debug", "selection"],
    body:
`아래 코드에서 잠재 버그를 찾아줘. 가장 가능성 높은 3개를 추정하고
각각 (1) 어떤 입력에서 (2) 어떤 증상이 나오는지 + 수정 방향을 알려줘.

\`\`\`
{{selection}}
\`\`\``,
  },
  {
    id: "doc-selection",
    name: "선택 영역 JSDoc/Docstring 생성",
    description: "함수/클래스에 표준 도큐먼트 코멘트 추가.",
    tags: ["docs", "selection"],
    body:
`아래 코드의 모든 export 함수/클래스에 한국어 문서 코멘트를 달아줘.
파라미터와 반환값 타입, 부작용을 명시.

\`\`\`
{{selection}}
\`\`\``,
  },
  {
    id: "ko-summary",
    name: "현재 파일 요약",
    description: "현재 열린 파일의 핵심 책임을 3-5줄로 한국어 요약.",
    tags: ["explain", "file"],
    body:
`@{{file}} 이 파일의 핵심 책임을 3~5줄로 한국어로 요약해줘.
주요 export, 의존성, 핵심 알고리즘 흐름을 짚어줘.`,
  },
  {
    id: "type-error",
    name: "타입 에러 해결",
    description: "선택한 코드의 TypeScript 타입 에러를 진단하고 수정.",
    tags: ["typescript", "selection"],
    body:
`아래 코드의 TypeScript 타입 에러를 찾아 해결해줘.
에러 원인을 한국어로 먼저 설명한 뒤, 수정된 코드를 제시.

\`\`\`ts
{{selection}}
\`\`\``,
  },
  {
    id: "i18n-extract",
    name: "한국어 i18n 추출",
    description: "선택 코드에서 하드코딩된 문자열을 i18n 키로 추출.",
    tags: ["i18n", "selection"],
    body:
`아래 코드에서 사용자에게 보이는 모든 문자열을 i18n 키로 추출해줘.
- 키는 \`namespace.component.label\` 패턴
- 추출 표 + 변환된 코드 둘 다 제시

\`\`\`
{{selection}}
\`\`\``,
  },
];

export function getBuiltinTemplates(): Template[] {
  return BUILTIN.map((t) => ({
    id: `builtin:${t.id}`,
    name: t.name,
    description: t.description,
    body: t.body,
    tags: t.tags,
    source: { kind: "builtin" },
  }));
}
