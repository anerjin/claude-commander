import { VariableContext, VariableName } from "./types";

const VAR_RE = /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g;

export function findVariables(body: string): VariableName[] {
  const set = new Set<VariableName>();
  for (const match of body.matchAll(VAR_RE)) {
    set.add(match[1] as VariableName);
  }
  return [...set];
}

export async function renderTemplate(body: string, context: VariableContext): Promise<string> {
  const used = findVariables(body);
  const resolved = new Map<string, string>();
  for (const name of used) {
    const resolver = context[name];
    resolved.set(name, resolver ? await resolver() : "");
  }
  return body.replace(VAR_RE, (_, name: string) => resolved.get(name) ?? "");
}

export function renderTemplateSync(body: string, values: Partial<Record<string, string>>): string {
  return body.replace(VAR_RE, (_, name: string) => values[name] ?? "");
}
