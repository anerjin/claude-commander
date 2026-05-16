import * as vscode from "vscode";
import { CommandEntry } from "./types";
import { buildIndex } from "./indexer";

interface PickItem extends vscode.QuickPickItem {
  entry: CommandEntry;
}

export async function showCommandQuickPick(): Promise<CommandEntry | undefined> {
  const index = await buildIndex();

  const items: PickItem[] = index.entries.map((e) => ({
    label: e.slash,
    description: e.descriptionKo ?? e.description ?? "",
    detail: e.source.plugin ? `${e.source.kind} · ${e.source.plugin}` : e.source.kind,
    entry: e,
  }));

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: "명령어 검색 — 이름 또는 설명으로 찾기",
    matchOnDescription: true,
    matchOnDetail: true,
    title: "🧭 Claude Commander — Command Explorer",
  });

  return picked?.entry;
}

export async function promptArgument(entry: CommandEntry): Promise<string | undefined> {
  if (!entry.argumentHint) return "";
  return vscode.window.showInputBox({
    title: entry.slash,
    prompt: `인자: ${entry.argumentHint}`,
    placeHolder: entry.argumentHint,
    ignoreFocusOut: true,
  });
}
