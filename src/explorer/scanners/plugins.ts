import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { CommandEntry } from "../types";
import { parseFrontmatter } from "../frontmatter";

interface InstalledPlugins {
  version: number;
  plugins: Record<string, Array<{ installPath: string; version: string }>>;
}

interface PluginManifest {
  name?: string;
  description?: string;
  skills?: string;
  commands?: string;
}

export async function scanPlugins(): Promise<CommandEntry[]> {
  const installedPath = path.join(os.homedir(), ".claude", "plugins", "installed_plugins.json");
  let manifest: InstalledPlugins;
  try {
    manifest = JSON.parse(await fs.readFile(installedPath, "utf8"));
  } catch {
    return [];
  }

  const entries: CommandEntry[] = [];

  for (const [key, installs] of Object.entries(manifest.plugins ?? {})) {
    const install = installs?.[0];
    if (!install?.installPath) continue;

    const pluginName = key.split("@")[0];
    const installPath = install.installPath;

    const pluginManifest = await readPluginManifest(installPath);

    const commandsRel = pluginManifest?.commands ?? (await dirExists(installPath, "commands") ? "./commands/" : undefined);
    const skillsRel   = pluginManifest?.skills   ?? (await dirExists(installPath, "skills")   ? "./skills/"   : undefined);

    if (commandsRel) {
      entries.push(...await scanCommandDir(installPath, commandsRel, pluginName));
    }
    if (skillsRel) {
      entries.push(...await scanSkillDir(installPath, skillsRel, pluginName));
    }
  }

  return entries;
}

async function readPluginManifest(installPath: string): Promise<PluginManifest | null> {
  const candidates = [
    path.join(installPath, ".claude-plugin", "plugin.json"),
    path.join(installPath, "plugin.json"),
  ];
  let merged: PluginManifest | null = null;
  for (const p of candidates) {
    try {
      const parsed = JSON.parse(await fs.readFile(p, "utf8")) as PluginManifest;
      merged = { ...(merged ?? {}), ...parsed };
    } catch {
      // not present, skip
    }
  }
  return merged;
}

async function dirExists(base: string, rel: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path.join(base, rel));
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function scanCommandDir(installPath: string, relDir: string, plugin: string): Promise<CommandEntry[]> {
  const dir = path.resolve(installPath, relDir);
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
      id: `plugin-command:${plugin}:${name}`,
      slash: `/${plugin}:${name}`,
      name,
      description: pickString(fm.data, "description"),
      argumentHint: pickString(fm.data, "argument-hint"),
      category: plugin,
      source: { kind: "plugin-command", plugin, file: filePath },
    });
  }

  return entries;
}

async function scanSkillDir(installPath: string, relDir: string, plugin: string): Promise<CommandEntry[]> {
  const dir = path.resolve(installPath, relDir);
  const entries: CommandEntry[] = [];
  let subdirs: string[];
  try {
    subdirs = await fs.readdir(dir);
  } catch {
    return entries;
  }

  for (const sub of subdirs) {
    const skillFile = path.join(dir, sub, "SKILL.md");
    let content = "";
    try {
      content = await fs.readFile(skillFile, "utf8");
    } catch {
      continue;
    }

    const fm = parseFrontmatter(content);
    const name = pickString(fm.data, "name") ?? sub;
    entries.push({
      id: `plugin-skill:${plugin}:${name}`,
      slash: `/${plugin}:${name}`,
      name,
      description: pickString(fm.data, "description"),
      argumentHint: pickString(fm.data, "argument-hint"),
      category: plugin,
      source: { kind: "plugin-skill", plugin, file: skillFile },
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
