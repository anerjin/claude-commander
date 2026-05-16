# 🧭 Claude Commander

> Claude Code를 위한 **한국어 친화형 커맨드 익스플로러 + 멀티세션 컴패니언** for VS Code

[![Marketplace](https://img.shields.io/badge/marketplace-vibecode.claude--commander-blue)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ 무엇이 다른가요?

- 🔍 **Command Explorer (M1)** — 설치된 모든 슬래시 커맨드를 자동 스캔, 검색·인자 폼·실행
- 🧩 **OMC 1급 통합** — `oh-my-claudecode` 의 모든 커맨드를 카테고리별로 정리
- 🇰🇷 **한국어 UX** — 모든 명령어에 한글 설명 / 예시 / 사용 시나리오
- ⚡ **프롬프트 템플릿 (M2)** — `{{file}}` `{{selection}}` `{{gitDiff}}` 변수 치환
- 🪟 **WSL 친화** — Windows 경로 자동 변환 (`C:\foo` → `/mnt/c/foo`)
- 🧠 **멀티 세션 (M3)** — 워크스페이스별 자동 부활, 즐겨찾기, 모델 프리셋
- 🎙️ **한국어 음성 입력 (M4)** — 로컬 Whisper, 네트워크 전송 없음

## 🚀 빠른 시작

1. 사전 조건: [Claude Code](https://code.claude.com) 설치
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
2. VS Code 좌측 액티비티 바의 🧭 **Claude Commander** 아이콘 클릭
3. 입력 후 `Cmd/Ctrl+Enter` 로 전송

## ⌨️ 기본 단축키

| 단축키 | 동작 |
| --- | --- |
| `Cmd/Ctrl+Enter` | 현재 입력 Claude로 전송 |
| `Cmd/Ctrl+K Cmd/Ctrl+C` | Command Explorer 열기 _(M1)_ |
| `Cmd/Ctrl+K Cmd/Ctrl+T` | 템플릿 선택 _(M2)_ |

## 🗺️ 로드맵

| 마일스톤 | 기능 |
| :---: | --- |
| **M0** ✅ | 스캐폴딩, 기본 입력 패널, 터미널 전송, WSL 경로 변환 |
| **M1** ✅ | Command Explorer — 인덱서 / 트리 뷰 / Quick Pick / 인자 폼 |
| **M2** | 프롬프트 템플릿 + 컨텍스트 자동 첨부 |
| **M3** | 멀티 세션 매니저 + 히스토리 검색 |
| **M4** | 한국어 음성 입력 |
| **M5** | 1.0.0 정식 출시 |

## 🛠️ 개발

```bash
npm install
npm run watch         # esbuild watch
# VS Code에서 F5 → "Run Extension" 로 디버그 호스트 실행
```

빌드 / 패키징:

```bash
npm run package       # 프로덕션 번들
npx vsce package      # .vsix 생성
```

## 📜 라이선스

MIT © vibecode
