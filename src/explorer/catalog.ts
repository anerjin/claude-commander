import { CommandEntry } from "./types";

interface BuiltinSpec {
  slash: string;
  description: string;
  descriptionKo: string;
  argumentHint?: string;
  tags?: string[];
}

const BUILTIN: BuiltinSpec[] = [
  { slash: "/help",          description: "Show all commands",                       descriptionKo: "모든 명령어 표시 (커스텀 포함)" },
  { slash: "/clear",         description: "Reset conversation",                      descriptionKo: "대화 기록 초기화 (새 작업 시작)" },
  { slash: "/compact",       description: "Compact conversation",                    descriptionKo: "대화 압축 (지시 추가 가능)",          argumentHint: "[지시]" },
  { slash: "/context",       description: "Visualize context usage",                 descriptionKo: "컨텍스트 사용량 시각화" },
  { slash: "/memory",        description: "Edit CLAUDE.md memory files",             descriptionKo: "CLAUDE.md 메모리 파일 편집" },
  { slash: "/init",          description: "Create CLAUDE.md",                        descriptionKo: "CLAUDE.md 파일 생성" },
  { slash: "/model",         description: "Switch Claude model",                     descriptionKo: "모델 전환 (Sonnet / Opus / Haiku)" },
  { slash: "/cost",          description: "Show token usage",                        descriptionKo: "토큰 사용량 확인" },
  { slash: "/status",        description: "Show status",                             descriptionKo: "현재 세션 상태 확인" },
  { slash: "/output-style",  description: "Set response style",                      descriptionKo: "응답 형식 설정" },
  { slash: "/review",        description: "Review current changes",                  descriptionKo: "현재 변경사항 코드 리뷰" },
  { slash: "/todos",         description: "List tracked TODOs",                      descriptionKo: "추적 중인 TODO 목록" },
  { slash: "/add-dir",       description: "Add working directory",                   descriptionKo: "추가 작업 디렉토리 포함 (모노레포용)" },
  { slash: "/hooks",         description: "Hook settings menu",                      descriptionKo: "훅 설정 메뉴" },
  { slash: "/mcp",           description: "Manage MCP servers",                      descriptionKo: "MCP 서버 관리" },
  { slash: "/export",        description: "Export conversation",                     descriptionKo: "대화 내보내기 (파일 또는 클립보드)", argumentHint: "[파일명]" },
  { slash: "/config",        description: "Open settings panel",                     descriptionKo: "설정 패널 열기" },
  { slash: "/doctor",        description: "Check installation",                      descriptionKo: "설치 상태 점검" },
  { slash: "/login",         description: "Log in",                                  descriptionKo: "로그인" },
  { slash: "/logout",        description: "Log out",                                 descriptionKo: "로그아웃" },
  { slash: "/permissions",   description: "Manage permissions",                      descriptionKo: "권한 관리" },
  { slash: "/terminal-setup",description: "Terminal setup",                          descriptionKo: "터미널 설정" },
  { slash: "/vim",           description: "Toggle vim mode",                         descriptionKo: "vim 모드 토글" },
  { slash: "/rewind",        description: "Rewind conversation/code",                descriptionKo: "대화 또는 코드 상태 되돌리기" },
  { slash: "/exit",          description: "Quit REPL",                               descriptionKo: "REPL 종료" },
  { slash: "/privacy-settings", description: "Privacy controls",                     descriptionKo: "데이터 공유/저장 제어" },
  { slash: "/install-github-app", description: "Install GitHub app",                 descriptionKo: "GitHub 앱 설치 (자동 PR 리뷰)" },
  { slash: "/pr_comments",   description: "View PR comments",                        descriptionKo: "PR 코멘트 보기" },

  { slash: "/agents",        description: "Manage subagents",                        descriptionKo: "커스텀 서브에이전트 관리" },
  { slash: "/plugin",        description: "Manage plugins",                          descriptionKo: "플러그인 설치/제거/마켓플레이스 관리", argumentHint: "[install|manage|marketplace|...]" },
  { slash: "/plan",          description: "Preview plan",                            descriptionKo: "플랜 모드 미리보기 / 편집" },
  { slash: "/ide",           description: "IDE integration",                         descriptionKo: "IDE 통합 (자동 연결 / 설정)" },
  { slash: "/resume",        description: "Resume previous session",                 descriptionKo: "이전 대화/세션 재개" },
  { slash: "/effort",        description: "Set effort level",                        descriptionKo: "현재 세션 effort 레벨 (low/medium/high/xhigh/max)", argumentHint: "<level>" },
  { slash: "/fast",          description: "Toggle fast mode",                        descriptionKo: "Fast 모드 토글 (Opus 4.6)" },
  { slash: "/feedback",      description: "Send feedback",                           descriptionKo: "Anthropic 에 피드백 전송" },
  { slash: "/loop",          description: "Recurring task",                          descriptionKo: "프롬프트/명령을 주기적으로 반복 실행",            argumentHint: "<interval> <prompt>" },
  { slash: "/chrome",        description: "Chrome integration",                      descriptionKo: "Claude in Chrome 통합 활성화" },
  { slash: "/upgrade",       description: "Upgrade Claude Code",                     descriptionKo: "Claude Code 업그레이드 / 사용량 한도 상향" },
  { slash: "/keybindings",   description: "Customize keybindings",                   descriptionKo: "키 바인딩 커스터마이즈" },

  // --- Claude Code 2.1.x 세션/컨텍스트 추가 ---
  { slash: "/usage",         description: "Token usage & cost",                      descriptionKo: "토큰 사용량·비용 상세 (별칭 /cost)" },
  { slash: "/skills",        description: "List available skills",                   descriptionKo: "사용 가능한 스킬 목록" },
  { slash: "/tasks",         description: "List background tasks",                   descriptionKo: "백그라운드 작업·서브에이전트 목록" },
  { slash: "/background",    description: "Run as background agent",                 descriptionKo: "세션을 분리해 백그라운드 에이전트로 실행",          argumentHint: "[프롬프트]" },
  { slash: "/fork",          description: "Spawn background subagent",               descriptionKo: "작업을 이어가며 백그라운드 서브에이전트 생성",       argumentHint: "<지시>" },
  { slash: "/branch",        description: "Branch conversation",                     descriptionKo: "대화를 분기해 다른 방향 시도",                   argumentHint: "[이름]" },
  { slash: "/cd",            description: "Change directory",                        descriptionKo: "세션 작업 디렉토리 변경",                       argumentHint: "<경로>" },
  { slash: "/goal",          description: "Set auto-continue goal",                  descriptionKo: "자동 진행 목표(조건) 설정",                     argumentHint: "[조건|clear]" },
  { slash: "/btw",           description: "Quick side question",                     descriptionKo: "본 대화를 벗어나지 않고 짧은 곁가지 질문",          argumentHint: "<질문>" },
  { slash: "/copy",          description: "Copy last response",                      descriptionKo: "마지막(또는 N번째) 응답 클립보드 복사",           argumentHint: "[N]" },
  { slash: "/diff",          description: "Open diff viewer",                        descriptionKo: "변경사항 인터랙티브 diff 뷰어 열기" },

  // --- 코드 품질/리뷰 스킬 ---
  { slash: "/code-review",   description: "Review diff",                             descriptionKo: "현재 변경사항 버그·정리 리뷰 (ultra=클라우드 멀티에이전트)", argumentHint: "[레벨] [--fix|--comment]" },
  { slash: "/security-review", description: "Security review",                       descriptionKo: "현재 변경사항 보안 취약점 점검" },
  { slash: "/simplify",      description: "Cleanup review",                          descriptionKo: "버그 탐색 없이 정리·간결화 리뷰",               argumentHint: "[--fix]" },
  { slash: "/verify",        description: "Verify change works",                     descriptionKo: "앱을 빌드·구동해 변경 동작 확인" },
  { slash: "/run",           description: "Run the app",                             descriptionKo: "앱을 실행·구동해 변경 확인" },
  { slash: "/run-skill-generator", description: "Teach /run & /verify",              descriptionKo: "/run·/verify 가 프로젝트를 빌드·실행하도록 학습" },

  // --- 대규모/자동화 작업 ---
  { slash: "/batch",         description: "Parallel worktree agents",                descriptionKo: "격리 워크트리 에이전트로 대규모 병렬 변경",        argumentHint: "<지시>" },
  { slash: "/autofix-pr",    description: "Auto-fix PR on CI fail",                  descriptionKo: "PR 브랜치 감시하다 CI 실패 시 자동 수정",         argumentHint: "[프롬프트]" },

  // --- 개발 도구 스킬 ---
  { slash: "/deep-research", description: "Deep research report",                    descriptionKo: "웹 검색·검증·인용 포함 심층 리서치 리포트",        argumentHint: "<질문>" },
  { slash: "/dataviz",       description: "Data viz design",                         descriptionKo: "차트·그래프·대시보드 디자인 가이드",             argumentHint: "[요청]" },
  { slash: "/claude-api",    description: "Claude API reference",                    descriptionKo: "Claude API 레퍼런스 / 마이그레이션 지원",         argumentHint: "[migrate|...]" },
  { slash: "/fewer-permission-prompts", description: "Reduce permission prompts",    descriptionKo: "트랜스크립트 분석해 권한 프롬프트 줄이기" },
  { slash: "/debug",         description: "Enable debug logging",                    descriptionKo: "디버그 로깅 활성화 (문제 해결용)",              argumentHint: "[설명]" },

  // --- 설정/플러그인 추가 ---
  { slash: "/color",         description: "Set prompt color",                        descriptionKo: "프롬프트 바 색상 설정",                       argumentHint: "[색상|default]" },
  { slash: "/reload-plugins", description: "Reload plugins",                         descriptionKo: "세션 재시작 없이 활성 플러그인 새로고침",         argumentHint: "[--force]" },
  { slash: "/advisor",       description: "Toggle advisor model",                    descriptionKo: "보조 어드바이저 모델 켜기/끄기",               argumentHint: "[모델|off]" },

  // --- 워크플로/연동 추가 ---
  { slash: "/design-sync",   description: "Sync design system",                      descriptionKo: "React 디자인 시스템을 Claude Design 으로 변환",   argumentHint: "[힌트]" },
  { slash: "/design-login",  description: "Authorize design sync",                   descriptionKo: "디자인 시스템 동기화 권한 인증" },
  { slash: "/remote-control", description: "Remote control session",                 descriptionKo: "다른 기기에서 로컬 세션 제어 활성화" },
  { slash: "/teleport",      description: "Pull web session",                        descriptionKo: "claude.ai 웹 세션을 터미널로 가져오기" },
  { slash: "/desktop",       description: "Continue in desktop app",                 descriptionKo: "세션을 Claude Code 데스크톱 앱에서 계속" },
  { slash: "/mobile",        description: "Mobile app QR",                           descriptionKo: "Claude 모바일 앱 QR 코드 표시" },
  { slash: "/insights",      description: "Session insights report",                 descriptionKo: "Claude Code 세션 분석 리포트 생성" },
  { slash: "/focus",         description: "Toggle focus view",                       descriptionKo: "포커스 뷰 토글" },
  { slash: "/install-slack-app", description: "Install Slack app",                   descriptionKo: "Claude Slack 앱 설치·워크스페이스 연동" },
  { slash: "/team-onboarding", description: "Package team setup",                    descriptionKo: "팀원 온보딩용 내 설정 패키지화" },
  { slash: "/passes",        description: "Share free week",                         descriptionKo: "Claude Code 무료 1주 공유 (자격 시)" },
  { slash: "/heapdump",      description: "Write heap snapshot",                     descriptionKo: "메모리 진단용 힙 스냅샷 기록" },

  // --- 바이너리 대조(scripts/sync-catalog.mjs)로 확인한 추가 명령 ---
  { slash: "/artifacts",     description: "Browse artifacts",                        descriptionKo: "게시·공유한 아티팩트 둘러보기" },
  { slash: "/workflows",     description: "Browse workflows",                        descriptionKo: "실행 중·완료된 워크플로 둘러보기" },
  { slash: "/release-notes", description: "View release notes",                      descriptionKo: "릴리스 노트 보기" },
  { slash: "/version",       description: "Show version",                            descriptionKo: "현재 세션 버전 표시 (자동 업데이트 반영 전)" },
  { slash: "/update",        description: "Update to latest",                        descriptionKo: "최신 버전으로 전환 (대화 유지)" },
  { slash: "/install",       description: "Install native build",                    descriptionKo: "Claude Code 네이티브 빌드 설치",              argumentHint: "[옵션]" },
  { slash: "/rename",        description: "Rename conversation",                     descriptionKo: "현재 대화 이름 변경",                        argumentHint: "[이름]" },
  { slash: "/recap",         description: "Session recap",                           descriptionKo: "현재 세션 한 줄 요약 생성" },
  { slash: "/session",       description: "Show session URL/QR",                     descriptionKo: "클라우드 세션 URL·QR 코드 표시" },
  { slash: "/stop",          description: "Stop background session",                 descriptionKo: "백그라운드 세션 중지 (트랜스크립트·워크트리 보존)" },
  { slash: "/theme",         description: "Change theme",                            descriptionKo: "테마 변경",                                argumentHint: "[default|fullscreen]" },
  { slash: "/tui",           description: "Set terminal UI renderer",                descriptionKo: "터미널 UI 렌더러 설정",                      argumentHint: "[default|fullscreen]" },
  { slash: "/scroll-speed",  description: "Adjust scroll speed",                     descriptionKo: "마우스 휠 스크롤 속도 조절" },
  { slash: "/brief",         description: "Toggle brief-only mode",                  descriptionKo: "간결 모드 토글" },
  { slash: "/voice",         description: "Toggle voice mode",                       descriptionKo: "음성 모드 토글",                            argumentHint: "[hold|tap|off]" },
  { slash: "/autocompact",   description: "Auto-summarize threshold",                descriptionKo: "자동 요약(압축) 임계값 설정",                 argumentHint: "[auto|<tokens>]" },
  { slash: "/pause-memory",  description: "Pause auto-memory",                       descriptionKo: "이 세션 동안 자동 메모리 일시중지" },
  { slash: "/reload-skills", description: "Reload skills",                           descriptionKo: "세션 중 디스크에서 변경된 스킬 다시 읽기" },
  { slash: "/skill-doctor",  description: "Inspect loaded skills",                   descriptionKo: "로드된 스킬 중 미사용·컨텍스트 낭비 항목 점검" },
  { slash: "/loops",         description: "Manage loops",                            descriptionKo: "loop 목록·생성·삭제 관리" },
  { slash: "/daemon",        description: "Manage background services",              descriptionKo: "백그라운드 서비스·루틴 관리" },
  { slash: "/powerup",       description: "Interactive lessons",                     descriptionKo: "짧은 인터랙티브 레슨으로 기능 익히기" },
  { slash: "/wellbeing",     description: "Break reminders",                         descriptionKo: "휴식 알림·방해금지 시간 설정" },
  { slash: "/usage-credits", description: "Configure usage credits",                 descriptionKo: "사용량 크레딧 설정 / 관리자에 요청" },
  { slash: "/design",        description: "Design access",                           descriptionKo: "Claude 에이전트의 Design 프로젝트 접근 허용/취소",  argumentHint: "consent|revoke" },
  { slash: "/remote-env",    description: "Cloud agent environment",                 descriptionKo: "클라우드 에이전트 기본 환경 선택" },
  { slash: "/web-setup",     description: "Set up on the web",                       descriptionKo: "GitHub 계정으로 웹용 Claude Code 설정" },
  { slash: "/setup-bedrock", description: "Configure Bedrock",                       descriptionKo: "Amazon Bedrock 인증·리전·모델 재설정" },
  { slash: "/setup-vertex",  description: "Configure Vertex AI",                     descriptionKo: "Google Vertex AI 인증·프로젝트·리전 재설정" },
  { slash: "/statusline",    description: "Configure status line",                   descriptionKo: "상태줄(statusline) 설정" },
  { slash: "/ultraplan",     description: "Ultra plan mode",                         descriptionKo: "울트라 플랜 모드 (심층 멀티에이전트 계획)",       argumentHint: "<프롬프트>" },
  { slash: "/stickers",      description: "Order stickers",                          descriptionKo: "Claude Code 스티커 주문" },
  { slash: "/radio",         description: "Claude FM radio",                         descriptionKo: "Claude FM 로파이 라디오 재생" },
];

export function getBuiltinCommands(): CommandEntry[] {
  return BUILTIN.map((b) => ({
    id: `builtin:${b.slash}`,
    slash: b.slash,
    name: b.slash.replace(/^\//, ""),
    description: b.description,
    descriptionKo: b.descriptionKo,
    argumentHint: b.argumentHint,
    category: "builtin",
    source: { kind: "builtin" },
    tags: b.tags,
  }));
}
