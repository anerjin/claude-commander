import * as vscode from "vscode";

const KNOWN_TERMINAL_NAMES = new Set(["Claude", "CLAUDE-CODE-ASSISTANT-WSL"]);

export class ClaudeTerminalManager {
  private current: vscode.Terminal | undefined;

  constructor(private readonly name: string) {}

  get terminal(): vscode.Terminal | undefined {
    return this.current;
  }

  ensure(): vscode.Terminal {
    if (this.current && !this.isDisposed(this.current)) {
      return this.current;
    }
    const term = vscode.window.createTerminal(this.name);
    this.current = term;
    term.show();
    term.sendText("claude");
    return term;
  }

  send(text: string): void {
    const term = this.ensure();
    term.show();
    term.sendText(text);
  }

  clear(): void {
    const term = this.current;
    if (!term) return;
    term.show();
    term.sendText("", false); // Ctrl+U: clear current input line
  }

  newSession(): vscode.Terminal {
    const term = vscode.window.createTerminal(this.name);
    this.current = term;
    term.show();
    term.sendText("claude");
    return term;
  }

  newAutoModeSession(): vscode.Terminal {
    const term = vscode.window.createTerminal(this.name);
    this.current = term;
    term.show();
    term.sendText("claude --dangerously-skip-permissions");
    return term;
  }

  disposeKnown(): void {
    for (const t of vscode.window.terminals) {
      if (KNOWN_TERMINAL_NAMES.has(t.name) || t.name.toLowerCase().includes("claude")) {
        t.dispose();
      }
    }
  }

  bindClose(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.window.onDidCloseTerminal((closed) => {
        if (closed === this.current) {
          this.current = undefined;
        }
      })
    );
  }

  private isDisposed(t: vscode.Terminal): boolean {
    return (t as unknown as { exitStatus?: unknown }).exitStatus !== undefined;
  }
}
