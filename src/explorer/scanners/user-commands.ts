import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { CommandEntry } from "../types";
import { parseFrontmatter } from "../frontmatter";

export async function scanUserCommands(): Promise<CommandEntry[]> {
  const dir = path.join(os.homedir(), ".claude", "commands");
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
    const description = pickString(fm.data, "description");
    const argumentHint = pickString(fm.data, "argument-hint");

    entries.push({
      id: `user:${name}`,
      slash: `/${name}`,
      name,
      description,
      argumentHint,
      category: "user",
      source: { kind: "user", file: filePath },
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
