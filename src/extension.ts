import * as vscode from "vscode";
import { CommanderViewProvider } from "./sidebar/commander-view";
import { ClaudeTerminalManager } from "./terminal/claude-terminal";
import { getPlatform } from "./platform";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const platform = getPlatform();
  console.log(`[claude-commander] activated on ${platform}`);

  const config = vscode.workspace.getConfiguration("claudeCommander");
  const terminalName = config.get<string>("terminalName", "Claude");
  const autoLaunch = config.get<boolean>("autoLaunchClaude", true);

  const terminal = new ClaudeTerminalManager(terminalName);
  terminal.bindClose(context);

  const provider = new CommanderViewProvider(context.extensionUri, terminal);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CommanderViewProvider.viewType, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  const register = (id: string, fn: (...args: unknown[]) => unknown) =>
    context.subscriptions.push(vscode.commands.registerCommand(id, fn));

  register("claudeCommander.focusInput", () => provider.focusInput());
  register("claudeCommander.send", () => provider.focusInput());
  register("claudeCommander.clear", () => provider.clearInput());
  register("claudeCommander.newSession", () => provider.newSession());
  register("claudeCommander.attachFile", () => provider["attach"]?.("file"));
  register("claudeCommander.attachFolder", () => provider["attach"]?.("folder"));

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
