import * as vscode from "vscode";
import * as os from "node:os";
import * as path from "node:path";
import { CommanderViewProvider } from "./sidebar/commander-view";
import { ClaudeTerminalManager } from "./terminal/claude-terminal";
import { getPlatform } from "./platform";
import { CommandTreeProvider } from "./explorer/tree-provider";
import { promptArgument, showCommandQuickPick } from "./explorer/quick-pick";
import { CommandEntry } from "./explorer/types";
import { pickAndRenderTemplate } from "./templates/quick-pick";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const platform = getPlatform();
  console.log(`[claude-commander] activated on ${platform}`);

  const config = vscode.workspace.getConfiguration("claudeCommander");
  const terminalName = config.get<string>("terminalName", "Claude");
  const autoLaunch = config.get<boolean>("autoLaunchClaude", true);

  const terminal = new ClaudeTerminalManager(terminalName);
  terminal.bindClose(context);

  const sidebar = new CommanderViewProvider(context.extensionUri, terminal);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CommanderViewProvider.viewType, sidebar, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  const explorer = new CommandTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("claudeCommander.explorerView", explorer)
  );
  void explorer.refresh();

  // Auto-refresh: watch every file-based command/skill source so newly added or
  // edited commands appear without a manual refresh. Built-in commands are baked
  // into the claude binary and cannot be watched — they live in the catalog.
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  const scheduleRefresh = () => {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(async () => {
      await explorer.refresh();
      await sidebar.sendCommandList();
    }, 300);
  };

  const homeClaude = vscode.Uri.file(path.join(os.homedir(), ".claude"));
  const watchers = [
    vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(homeClaude, "commands/**/*.md")),
    vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(homeClaude, "skills/**/*.md")),
    vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(homeClaude, "plugins/installed_plugins.json")),
    vscode.workspace.createFileSystemWatcher("**/.claude/commands/**/*.md"),
    vscode.workspace.createFileSystemWatcher("**/.claude/skills/**/*.md"),
  ];
  for (const w of watchers) {
    w.onDidCreate(scheduleRefresh);
    w.onDidChange(scheduleRefresh);
    w.onDidDelete(scheduleRefresh);
    context.subscriptions.push(w);
  }
  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(scheduleRefresh));

  const runCommand = async (entry: CommandEntry) => {
    let payload = entry.slash;
    if (entry.argumentHint) {
      const arg = await promptArgument(entry);
      if (arg === undefined) return;
      if (arg.trim().length > 0) payload = `${entry.slash} ${arg}`;
    }
    terminal.send(payload);
  };

  const register = (id: string, fn: (...args: any[]) => unknown) =>
    context.subscriptions.push(vscode.commands.registerCommand(id, fn));

  register("claudeCommander.focusInput", () => sidebar.focusInput());
  register("claudeCommander.send", () => sidebar.focusInput());
  register("claudeCommander.clear", () => sidebar.clearInput());
  register("claudeCommander.newSession", () => sidebar.newSession());
  register("claudeCommander.newAutoModeSession", () => sidebar.newAutoModeSession());
  register("claudeCommander.attachFile", () => (sidebar as any).attach?.("file"));
  register("claudeCommander.attachFolder", () => (sidebar as any).attach?.("folder"));
  register("claudeCommander.refreshExplorer", async () => {
    await explorer.refresh();
    await sidebar.sendCommandList();
  });
  register("claudeCommander.openExplorer", async () => {
    const picked = await showCommandQuickPick();
    if (picked) await runCommand(picked);
  });
  register("claudeCommander.runCommand", (entry: CommandEntry) => runCommand(entry));
  register("claudeCommander.openTemplates", async () => {
    const rendered = await pickAndRenderTemplate();
    if (rendered !== undefined) await sidebar.insertText(rendered);
  });

  if (autoLaunch) {
    setTimeout(() => {
      try {
        terminal.disposeKnown();
        terminal.ensure();
      } catch (err) {
        console.error("[claude-commander] failed to launch claude:", err);
        vscode.window.showWarningMessage(
          "Claude를 시작할 수 없습니다. `claude` 명령어가 설치되어 있는지 확인해주세요."
        );
      }
    }, 800);
  }
}

export function deactivate(): void {
  // nothing to clean up
}
