import * as vscode from "vscode";
import { CommandCategory, CommandEntry } from "./types";
import { IndexResult, buildIndex } from "./indexer";

export class ExplorerNode extends vscode.TreeItem {
  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly kind: "category" | "command",
    public readonly entry?: CommandEntry,
    public readonly category?: CommandCategory
  ) {
    super(label, collapsibleState);
  }
}

export class CommandTreeProvider implements vscode.TreeDataProvider<ExplorerNode> {
  private readonly _onDidChange = new vscode.EventEmitter<ExplorerNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  private index: IndexResult | undefined;

  async refresh(): Promise<void> {
    this.index = await buildIndex();
    this._onDidChange.fire(undefined);
  }

  getTreeItem(node: ExplorerNode): vscode.TreeItem {
    return node;
  }

  async getChildren(parent?: ExplorerNode): Promise<ExplorerNode[]> {
    if (!this.index) {
      this.index = await buildIndex();
    }

    if (!parent) {
      return this.index.categories.map((cat) => this.makeCategoryNode(cat));
    }

    if (parent.kind === "category" && parent.category) {
      return parent.category.entries.map((entry) => this.makeCommandNode(entry));
    }

    return [];
  }

  private makeCategoryNode(cat: CommandCategory): ExplorerNode {
    const node = new ExplorerNode(
      `${cat.label}  (${cat.entries.length})`,
      vscode.TreeItemCollapsibleState.Collapsed,
      "category",
      undefined,
      cat
    );
    node.iconPath = new vscode.ThemeIcon(cat.icon);
    node.contextValue = "claudeCommander.category";
    return node;
  }

  private makeCommandNode(entry: CommandEntry): ExplorerNode {
    const label = entry.slash;
    const node = new ExplorerNode(label, vscode.TreeItemCollapsibleState.None, "command", entry);
    node.description = entry.descriptionKo ?? entry.description ?? "";
    node.tooltip = this.makeTooltip(entry);
    node.iconPath = new vscode.ThemeIcon("terminal");
    node.contextValue = "claudeCommander.command";
    node.command = {
      command: "claudeCommander.runCommand",
      title: "Run command",
      arguments: [entry],
    };
    return node;
  }

  private makeTooltip(entry: CommandEntry): vscode.MarkdownString {
    const lines: string[] = [];
    lines.push(`### \`${entry.slash}\``);
    if (entry.descriptionKo) lines.push(entry.descriptionKo);
    if (entry.description && entry.description !== entry.descriptionKo) {
      lines.push(`_${entry.description}_`);
    }
    if (entry.argumentHint) {
      lines.push("");
      lines.push(`**인자**: \`${entry.argumentHint}\``);
    }
    lines.push("");
    lines.push(`출처: \`${entry.source.kind}\`${entry.source.plugin ? ` · ${entry.source.plugin}` : ""}`);
    if (entry.source.file) {
      lines.push(`경로: \`${entry.source.file}\``);
    }
    const md = new vscode.MarkdownString(lines.join("\n\n"));
    md.isTrusted = true;
    return md;
  }
}
