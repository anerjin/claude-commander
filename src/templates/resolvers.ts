import * as vscode from "vscode";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { VariableContext } from "./types";

const execAsync = promisify(exec);

export function buildResolverContext(): VariableContext {
  return {
    file: resolveFile,
    selection: resolveSelection,
    lineRange: resolveLineRange,
    gitDiff: () => resolveGit(["diff"]),
    gitDiffStaged: () => resolveGit(["diff", "--staged"]),
    branch: () => resolveGit(["rev-parse", "--abbrev-ref", "HEAD"]),
    cwd: resolveCwd,
    lastCommit: () => resolveGit(["log", "-1", "--pretty=format:%h %s"]),
  };
}

async function resolveFile(): Promise<string> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return "";
  return editor.document.uri.fsPath;
}

async function resolveSelection(): Promise<string> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return "";
  const sel = editor.selection;
  if (sel.isEmpty) return "";
  return editor.document.getText(sel);
}

async function resolveLineRange(): Promise<string> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return "";
  const sel = editor.selection;
  if (sel.isEmpty) return "";
  return `${sel.start.line + 1}-${sel.end.line + 1}`;
}

async function resolveCwd(): Promise<string> {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) return folders[0].uri.fsPath;
  return process.cwd();
}

async function resolveGit(args: string[]): Promise<string> {
  const cwd = await resolveCwd();
  if (!cwd) return "";
  try {
    const { stdout } = await execAsync(`git ${args.map(quote).join(" ")}`, {
      cwd,
      maxBuffer: 1024 * 1024 * 4,
    });
    return stdout.trim();
  } catch {
    return "";
  }
}

function quote(s: string): string {
  if (!/[\s"']/.test(s)) return s;
  return `"${s.replace(/"/g, '\\"')}"`;
}
