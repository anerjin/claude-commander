import * as vscode from "vscode";
import { ClaudeTerminalManager } from "../terminal/claude-terminal";
import { getPlatform, maybeConvertPath } from "../platform";
import { buildWebviewHtml, makeNonce } from "./webview-html";

type Inbound =
  | { type: "ready" }
  | { type: "send"; text: string }
  | { type: "clear" }
  | { type: "newSession" }
  | { type: "attachFile" }
  | { type: "attachFolder" };

export class CommanderViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "claudeCommander.mainView";

  private view: vscode.WebviewView | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly terminal: ClaudeTerminalManager
  ) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    const nonce = makeNonce();
    view.webview.html = buildWebviewHtml(view.webview, nonce);

    view.webview.onDidReceiveMessage((msg: Inbound) => this.onMessage(msg));
  }

  focusInput(): void {
    if (!this.view) {
      vscode.commands.executeCommand(`${CommanderViewProvider.viewType}.focus`);
      return;
    }
    this.view.show?.(true);
    this.view.webview.postMessage({ type: "focusInput" });
  }

  clearInput(): void {
    this.view?.webview.postMessage({ type: "clearInput" });
    this.terminal.clear();
  }

  async insertText(text: string): Promise<void> {
    if (!this.view) {
      await vscode.commands.executeCommand(`${CommanderViewProvider.viewType}.focus`);
    }
    this.view?.show?.(true);
    this.view?.webview.postMessage({ type: "insertText", text });
  }

  newSession(): void {
    this.terminal.newSession();
  }

  private async onMessage(msg: Inbound): Promise<void> {
    switch (msg.type) {
      case "ready":
        this.view?.webview.postMessage({ type: "init", platform: getPlatform() });
        return;
      case "send":
        if (msg.text.trim()) this.terminal.send(msg.text);
        return;
      case "clear":
        this.terminal.clear();
        return;
      case "newSession":
        this.terminal.newSession();
        return;
      case "attachFile":
        await this.attach("file");
        return;
      case "attachFolder":
        await this.attach("folder");
        return;
    }
  }

  private async attach(kind: "file" | "folder"): Promise<void> {
    const uris = await vscode.window.showOpenDialog({
      canSelectFiles: kind === "file",
      canSelectFolders: kind === "folder",
      canSelectMany: kind === "file",
      openLabel: kind === "file" ? "파일 첨부" : "폴더 첨부",
    });
    if (!uris || uris.length === 0) return;
    const text = uris
      .map((u) => maybeConvertPath(u.fsPath))
      .map((p) => (/\s/.test(p) ? `"${p}"` : p))
      .join(" ");
    this.view?.webview.postMessage({ type: "insertText", text: text + " " });
  }
}
