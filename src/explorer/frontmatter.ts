export interface Frontmatter {
  data: Record<string, string | string[]>;
  body: string;
}

const DELIM = /^---\s*$/;

export function parseFrontmatter(source: string): Frontmatter {
  const lines = source.split(/\r?\n/);
  if (lines.length === 0 || !DELIM.test(lines[0])) {
    return { data: {}, body: source };
  }

  const end = lines.slice(1).findIndex((l) => DELIM.test(l));
  if (end === -1) {
    return { data: {}, body: source };
  }

  const yamlLines = lines.slice(1, end + 1);
  const body = lines.slice(end + 2).join("\n");

  return { data: parseSimpleYaml(yamlLines), body };
}

function parseSimpleYaml(lines: string[]): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  let currentKey: string | null = null;
  let mode: "single" | "block" | "list" | null = null;
  const blockBuffer: string[] = [];
  const listBuffer: string[] = [];
  let blockIndent = 0;

  const commit = () => {
    if (currentKey === null) return;
    if (mode === "block") {
      out[currentKey] = blockBuffer.join("\n").trim();
    } else if (mode === "list") {
      out[currentKey] = [...listBuffer];
    }
    blockBuffer.length = 0;
    listBuffer.length = 0;
  };

  for (const raw of lines) {
    if (raw === "" || /^\s*#/.test(raw)) continue;

    if (mode === "block") {
      const indentMatch = raw.match(/^(\s+)(.*)$/);
      if (indentMatch && indentMatch[1].length >= blockIndent) {
        blockBuffer.push(indentMatch[2]);
        continue;
      } else {
        commit();
        mode = null;
        currentKey = null;
      }
    }

    if (mode === "list") {
      const listItem = raw.match(/^\s*-\s+(.*)$/);
      if (listItem) {
        listBuffer.push(stripQuotes(listItem[1]));
        continue;
      } else {
        commit();
        mode = null;
        currentKey = null;
      }
    }

    const kv = raw.match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    commit();
    currentKey = kv[1];
    const value = kv[2].trim();

    if (value === "|" || value === ">" || value === "|-" || value === ">-") {
      mode = "block";
      blockIndent = 2;
    } else if (value === "") {
      mode = "list";
    } else {
      mode = "single";
      out[currentKey] = stripQuotes(value);
      mode = null;
      currentKey = null;
    }
  }

  commit();
  return out;
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}
