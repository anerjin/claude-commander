import { CommandCategory, CommandEntry } from "./types";
import { getBuiltinCommands } from "./catalog";
import { scanUserCommands } from "./scanners/user-commands";
import { scanProjectCommands } from "./scanners/project-commands";
import { scanSkills } from "./scanners/skills";
import { scanPlugins } from "./scanners/plugins";
import translations from "../../assets/translations-ko.json";

export interface IndexResult {
  entries: CommandEntry[];
  categories: CommandCategory[];
  scannedAt: number;
}

const CATEGORY_ORDER: Record<string, number> = {
  builtin: 100,
  project: 150,
  user: 200,
  skill: 250,
};

const CATEGORY_LABELS_KO: Record<string, string> = {
  builtin: "📦 내장 (Claude Code)",
  project: "📁 프로젝트 커맨드",
  user: "👤 사용자 커스텀",
  skill: "🧠 스킬 (사용자/프로젝트)",
};

const CATEGORY_ICONS: Record<string, string> = {
  builtin: "package",
  project: "folder",
  user: "person",
  skill: "lightbulb",
};

export async function buildIndex(): Promise<IndexResult> {
  const [builtin, project, user, skill, plugin] = await Promise.all([
    Promise.resolve(getBuiltinCommands()),
    scanProjectCommands(),
    scanUserCommands(),
    scanSkills(),
    scanPlugins(),
  ]);

  const raw = [...builtin, ...project, ...user, ...skill, ...plugin];
  const entries = raw.map(applyTranslation);
  const categories = groupByCategory(entries);
  return { entries, categories, scannedAt: Date.now() };
}

function applyTranslation(entry: CommandEntry): CommandEntry {
  if (entry.descriptionKo) return entry;
  const value = (translations as Record<string, unknown>)[entry.slash];
  if (typeof value !== "string" || value.length === 0) return entry;
  return { ...entry, descriptionKo: value };
}

function groupByCategory(entries: CommandEntry[]): CommandCategory[] {
  const map = new Map<string, CommandEntry[]>();
  for (const e of entries) {
    const list = map.get(e.category) ?? [];
    list.push(e);
    map.set(e.category, list);
  }

  const cats: CommandCategory[] = [];
  for (const [id, list] of map) {
    cats.push({
      id,
      label: CATEGORY_LABELS_KO[id] ?? `🧩 ${id}`,
      icon: CATEGORY_ICONS[id] ?? "extensions",
      order: CATEGORY_ORDER[id] ?? 300 + cats.length,
      entries: list.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  return cats.sort((a, b) => a.order - b.order);
}
