import * as vscode from "vscode";

export function buildWebviewHtml(webview: vscode.Webview, nonce: string): string {
  const csp = [
    "default-src 'none'",
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src 'nonce-${nonce}'`,
    `img-src ${webview.cspSource} data:`,
    "font-src 'none'",
  ].join("; ");

  return /* html */ `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Claude Commander</title>
  <style>
    :root {
      color-scheme: light dark;
    }
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
    }
    .container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      padding: 10px;
      gap: 8px;
      box-sizing: border-box;
    }
    select.command-picker {
      width: 100%;
      box-sizing: border-box;
      padding: 6px 8px;
      font-size: 12px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 4px;
      outline: none;
    }
    select.command-picker:focus {
      border-color: var(--vscode-focusBorder);
    }
    textarea {
      flex: 1;
      min-height: 120px;
      resize: vertical;
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 4px;
      outline: none;
    }
    textarea:focus {
      border-color: var(--vscode-focusBorder);
    }
    .actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }
button {
      flex: 1 1 auto;
      padding: 6px 10px;
      cursor: pointer;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      font-size: 12px;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    button.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .hint {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="container">
    <select id="command-picker" class="command-picker" title="슬래시 커맨드 선택">
      <option value="">/ 명령어 선택…</option>
    </select>

    <textarea id="input" placeholder="여기에 입력하세요. Cmd/Ctrl+Enter 로 전송됩니다."></textarea>

    <div class="actions">
      <button id="send">보내기</button>
      <button id="clear" class="secondary">초기화</button>
      <button id="new" class="secondary">새 세션</button>
    </div>

    <div class="actions">
      <button id="attach-file" class="secondary">파일</button>
      <button id="attach-folder" class="secondary">폴더</button>
      <button id="auto-mode" title="claude --dangerously-skip-permissions">Auto Mode</button>
    </div>

    <div class="hint">
      ⌘/Ctrl+K ⌘/Ctrl+C 명령어 검색 · ⌘/Ctrl+K ⌘/Ctrl+T 템플릿
    </div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const input = document.getElementById('input');
    const picker = document.getElementById('command-picker');

    const send = () => {
      const text = input.value;
      if (!text.trim()) return;
      vscode.postMessage({ type: 'send', text });
    };

    document.getElementById('send').addEventListener('click', send);
    document.getElementById('clear').addEventListener('click', () => {
      input.value = '';
      vscode.postMessage({ type: 'clear' });
    });
    document.getElementById('new').addEventListener('click', () => {
      vscode.postMessage({ type: 'newSession' });
    });
    document.getElementById('auto-mode').addEventListener('click', () => {
      vscode.postMessage({ type: 'newAutoModeSession' });
    });

    picker.addEventListener('change', () => {
      const slash = picker.value;
      picker.value = '';
      if (!slash) return;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const insertion = slash + ' ';
      input.value = input.value.slice(0, start) + insertion + input.value.slice(end);
      const cursor = start + insertion.length;
      input.setSelectionRange(cursor, cursor);
      input.focus();
    });

    const renderCommands = (groups) => {
      while (picker.options.length > 1) picker.remove(1);
      for (const group of groups) {
        const og = document.createElement('optgroup');
        og.label = group.label;
        for (const cmd of group.entries) {
          const opt = document.createElement('option');
          opt.value = cmd.slash;
          opt.textContent = cmd.slash + (cmd.desc ? ' — ' + cmd.desc : '');
          opt.title = cmd.desc || cmd.slash;
          og.appendChild(opt);
        }
        picker.appendChild(og);
      }
    };
    document.getElementById('attach-file').addEventListener('click', () => {
      vscode.postMessage({ type: 'attachFile' });
    });
    document.getElementById('attach-folder').addEventListener('click', () => {
      vscode.postMessage({ type: 'attachFolder' });
    });

    input.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        send();
      }
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'commands') {
        renderCommands(msg.groups);
      } else if (msg.type === 'insertText') {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.value = input.value.slice(0, start) + msg.text + input.value.slice(end);
        input.focus();
      } else if (msg.type === 'clearInput') {
        input.value = '';
      } else if (msg.type === 'focusInput') {
        input.focus();
      }
    });

    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`;
}

export function makeNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 32; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}
