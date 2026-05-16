export type CommandSourceKind = "builtin" | "user" | "plugin-command" | "plugin-skill";

export interface CommandSource {
  kind: CommandSourceKind;
  plugin?: string;
  file?: string;
}

export interface CommandEntry {
  id: string;
  slash: string;
  name: string;
  description?: string;
  descriptionKo?: string;
  argumentHint?: string;
  category: string;
  source: CommandSource;
  tags?: string[];
}

export interface CommandCategory {
  id: string;
  label: string;
  icon: string;
  order: number;
  entries: CommandEntry[];
}
