import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import * as vscode from "vscode";
import { CommandEntry } from "../types";
import { parseFrontmatter } from "../frontmatter";

/**
 * Scans skills invoked as `/skill-name` from `.claude/skills/<name>/SKILL.md`,
 * both at the user level (`~/.claude/skills`) and per open workspace folder
 * (`<workspaceFolder>/.claude/skills`). Skills are auto-discovered from disk.
 */
export async function scanSkills(): Promise<CommandEntry[]> {
  const jobs: Array<Promise<CommandEntry[]>> = [
    scanSkillRoot(path.join(os.homedir(), ".claude", "skills"), "user-skill"),
  ];

  for (const folder of vscode.workspace.workspaceFolders ?? []) {
    jobs.push(scanSkillRoot(path.join(folder.uri.fsPath, ".claude", "skills"), "project-skill"));
  }

  const results = await Promise.all(jobs);
  return results.flat();
}

async function scanSkillRoot(
  root: string,
  kind: "user-skill" | "project-skill"
): Promise<CommandEntry[]> {
  const entries: CommandEntry[] = [];

  let subdirs: string[];
  try {
    subdirs = await fs.readdir(root);
  } catch {
    return entries;
  }

  for (const sub of subdirs) {
    const skillFile = path.join(root, sub, "SKILL.md");
    let content = "";
    try {
      content = await fs.readFile(skillFile, "utf8");
    } catch {
      continue;
    }

    const fm = parseFrontmatter(content);
    const name = pickString(fm.data, "name") ?? sub;
    entries.push({
      id: `${kind}:${skillFile}`,
      slash: `/${name}`,
      name,
      description: pickString(fm.data, "description"),
      argumentHint: pickString(fm.data, "argument-hint"),
      category: "skill",
      source: { kind, file: skillFile },
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
