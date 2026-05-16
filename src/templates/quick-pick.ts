import * as vscode from "vscode";
import { Template } from "./types";
import { getBuiltinTemplates } from "./catalog";
import { renderTemplate, findVariables } from "./engine";
import { buildResolverContext } from "./resolvers";

interface TemplateItem extends vscode.QuickPickItem {
  template: Template;
}

export async function pickAndRenderTemplate(): Promise<string | undefined> {
  const templates = getBuiltinTemplates();

  const items: TemplateItem[] = templates.map((t) => ({
    label: t.name,
    description: t.description ?? "",
    detail: variableSummary(t.body),
    template: t,
  }));

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: "프롬프트 템플릿 선택",
    matchOnDescription: true,
    matchOnDetail: true,
    title: "📝 Claude Commander — Prompt Templates",
  });

  if (!picked) return undefined;

  const context = buildResolverContext();
  return renderTemplate(picked.template.body, context);
}

function variableSummary(body: string): string {
  const vars = findVariables(body);
  if (vars.length === 0) return "(no variables)";
  return vars.map((v) => `{{${v}}}`).join(" · ");
}
