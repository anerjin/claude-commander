import * as vscode from "vscode";
import { ClaudeTerminalManager } from "../terminal/claude-terminal";
import { getPlatform, maybeConvertPath } from "../platform";
import { buildWebviewHtml, makeNonce } from "./webview-html";
import { buildIndex } from "../explorer/indexer";

type Inbound =
  | { type: "ready" }
  | { type: "send"; text: string }
  | { type: "clear" }
  | { type: "newSession" }
  | { type: "newAutoModeSession" }
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

  async sendCommandList(): Promise<void> {
    if (!this.view) return;
    const index = await buildIndex();
    const groups = index.categories.map((cat) => ({
      label: cat.label,
      entries: cat.entries.map((e) => ({
        slash: e.slash,
        desc: e.descriptionKo ?? e.description ?? "",
      })),
    }));
    this.view.webview.postMessage({ type: "commands", groups });
  }

  newSession(): void {
    this.terminal.newSession();
  }

  async newAutoModeSession(): Promise<void> {
    const choice = await vscode.window.showWarningMessage(
      "Auto Mode 는 `claude --dangerously-skip-permissions` 로 새 세션을 시작합니다.\n모든 권한 프롬프트가 우회되니 신뢰된 작업에만 사용하세요.",
      { modal: true },
      "계속",
      "취소"
    );
    if (choice !== "계속") return;
    this.terminal.newAutoModeSession();
  }

  private async onMessage(msg: Inbound): Promise<void> {
    switch (msg.type) {
      case "ready":
        this.view?.webview.postMessage({ type: "init", platform: getPlatform() });
        void this.sendCommandList();
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
      case "newAutoModeSession":
        await this.newAutoModeSession();
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
