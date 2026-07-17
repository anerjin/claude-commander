import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { CommandEntry } from "../types";
import { parseFrontmatter } from "../frontmatter";

/**
 * Scans project-level slash commands from `<workspaceFolder>/.claude/commands/*.md`
 * across every open workspace folder. These are auto-discovered from disk — no
 * hardcoding — so adding a `.md` file makes the command appear on the next refresh.
 */
export async function scanProjectCommands(): Promise<CommandEntry[]> {
  const folders = vscode.workspace.workspaceFolders ?? [];
  const results = await Promise.all(folders.map((f) => scanFolder(f.uri.fsPath)));
  return results.flat();
}

async function scanFolder(root: string): Promise<CommandEntry[]> {
  const dir = path.join(root, ".claude", "commands");
  const entries: CommandEntry[] = [];

  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return entries;
  }

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const name = file.replace(/\.md$/, "");
    const filePath = path.join(dir, file);

    let content = "";
    try {
      content = await fs.readFile(filePath, "utf8");
    } catch {
      continue;
    }

    const fm = parseFrontmatter(content);
    entries.push({
      id: `project:${filePath}`,
      slash: `/${name}`,
      name,
      description: pickString(fm.data, "description"),
      argumentHint: pickString(fm.data, "argument-hint"),
      category: "project",
      source: { kind: "project-command", file: filePath },
    });
  }

  return entries;
}

function pickString(data: Record<string, string | string[]>, key: string): string | undefined {
  const v = data[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.join(", ");
  return undefined;
}
