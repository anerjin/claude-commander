export type TemplateSourceKind = "builtin" | "user";

export interface TemplateSource {
  kind: TemplateSourceKind;
  file?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  body: string;
  tags?: string[];
  source: TemplateSource;
}

export type VariableName =
  | "file"
  | "selection"
  | "gitDiff"
  | "gitDiffStaged"
  | "branch"
  | "cwd"
  | "lastCommit"
  | "lineRange";

export type VariableResolver = () => Promise<string>;

export type VariableContext = Record<VariableName, VariableResolver>;
