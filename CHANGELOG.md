# Changelog

## [Unreleased]

### M2 — Prompt Templates (2026-05-16)

- **12개 한글 프롬프트 템플릿 번들** — 코드 리뷰 / 설명 / 리팩토링 / 테스트 생성 /
  커밋 메시지 / PR 설명 / 버그 사냥 / 문서화 / 타입 에러 / i18n 추출 등
- **변수 치환 엔진** — `{{file}}` `{{selection}}` `{{gitDiff}}` `{{gitDiffStaged}}`
  `{{branch}}` `{{cwd}}` `{{lastCommit}}` `{{lineRange}}` 자동 해석
- **변수 리졸버** — 현재 에디터(선택 영역 / 파일 경로 / 라인 범위) +
  `git diff` / `git rev-parse` 결과 자동 주입
- **Template Quick Pick** — `Cmd/Ctrl+K Cmd/Ctrl+T` 로 템플릿 선택,
  렌더링 결과를 사이드바 입력창에 자동 삽입
- 사이드바 타이틀 바에 템플릿 버튼 추가

### M1 — Command Explorer (2026-05-16)

- **Command Explorer 트리 뷰** — 사이드바에 모든 슬래시 커맨드 카테고리별 표시
- **Quick Pick 검색** — `Cmd/Ctrl+K Cmd/Ctrl+C` 로 96+ 명령어 검색
- **인자 폼** — `argument-hint` 가 있는 명령어는 InputBox로 인자 받음
- **인덱서**:
  - 28개 Claude Code 내장 슬래시 커맨드 (한글 설명 포함)
  - `~/.claude/commands/*.md` 사용자 커스텀
  - `~/.claude/plugins/installed_plugins.json` 기반 플러그인 자동 발견
  - 플러그인의 `commands/` + `skills/` 디렉토리 둘 다 스캔
  - 매니페스트 두 위치 fallback (`.claude-plugin/plugin.json` + 루트 `plugin.json`)
- **frontmatter 파서** — yaml 의존성 없이 단순값/리스트/블록 스칼라 지원
- **Tooltip** — 명령어 호버 시 한/영 설명 + 인자 힌트 + 출처 경로 표시

### M0 — Foundation (2026-05-16)

- 프로젝트 스캐폴딩 (TypeScript + esbuild)
- 액티비티 바 아이콘 + 사이드바 webview
- `Cmd/Ctrl+Enter` 전송, 입력 초기화, 새 세션
- 파일/폴더 첨부 (WSL 환경에서 경로 자동 변환)
- macOS / WSL / Windows / Linux 플랫폼 감지
