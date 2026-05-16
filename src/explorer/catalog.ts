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
