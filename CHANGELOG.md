# Changelog

## [0.0.4] — 2026-07-16

### 카탈로그 동기화 도구 + 내장 명령 추가

- **`scripts/sync-catalog.mjs`** — 설치된 `claude` 바이너리에서 슬래시 명령 정의
  (`type:"local"|"local-jsx"|"prompt"` 및 스킬 `pluginCommand`)를 추출해 `catalog.ts`와
  대조, 신규/제거 후보를 리포트하는 유지보수 도구. `npm run sync:catalog`(리포트),
  `npm run sync:catalog:stubs`(붙여넣기용 스텁). `CLAUDE_BIN` 환경변수로 경로 지정 가능
- 위 도구로 확인한 **사용자向 내장 명령 33개 추가** — `/artifacts` `/workflows`
  `/release-notes` `/rename` `/theme` `/tui` `/voice` `/session` `/recap` `/update`
  `/reload-skills` `/skill-doctor` `/autocompact` `/pause-memory` `/usage-credits`
  `/design` `/setup-bedrock` `/setup-vertex` `/statusline` `/ultraplan` 등 (내장 총 111개)
- 전환 상태 UI(`/pro-trial-expired` 등)·deprecated(`/extra-usage` `/ultrareview`)·
  서브커맨드(`/design-consent` `/design-revoke`)는 의도적으로 제외

## [0.0.3] — 2026-07-16

### 파일 기반 명령/스킬 자동 수집 + 실시간 감지

- **프로젝트 커맨드 스캔** — 열려 있는 각 워크스페이스의 `.claude/commands/*.md` 자동 수집 (`📁 프로젝트 커맨드`)
- **스킬 스캔** — `~/.claude/skills/*/SKILL.md`(사용자) 및 `<워크스페이스>/.claude/skills/*/SKILL.md`(프로젝트) 자동 수집 (`🧠 스킬`)
- **FileSystemWatcher** — 위 디렉토리 + `~/.claude/commands`·`installed_plugins.json` 변경 시 자동 새로고침 (수동 새로고침 불필요, 300ms 디바운스)
- 참고: 내장 슬래시 명령은 `claude` 바이너리에 컴파일되어 런타임 수집이 불가능하여 카탈로그로 유지

## [0.0.2] — 2026-07-16

### 내장 명령 카탈로그 대폭 확장 (Claude Code 2.1.x)

- 내장 명령 40개 → 79개로 확장, 각 항목 한글 설명·인자 힌트 포함
- 리뷰/품질 스킬 추가: `/code-review` `/security-review` `/simplify` `/verify` `/run`
- 도구 스킬 추가: `/deep-research` `/dataviz` `/claude-api` `/fewer-permission-prompts` `/debug`
- 세션/작업 커맨드 추가: `/usage` `/skills` `/tasks` `/background` `/fork` `/branch` `/goal` `/btw` `/copy` `/diff` `/cd`
- 대규모/연동 커맨드 추가: `/batch` `/autofix-pr` `/teleport` `/desktop` `/design-sync` `/install-slack-app` 등

## [Unreleased]

### Auto Mode 버튼 (2026-05-16)

- 사이드바에 `⚡ Auto Mode (권한 우회 세션)` 버튼 추가
- `claude --dangerously-skip-permissions` 로 새 터미널 세션 시작
- 클릭 시 모달 확인 다이얼로그로 의도 재확인
- Command Palette `Claude Commander: ⚡ Auto Mode 세션 (권한 우회)` 로도 실행 가능

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
