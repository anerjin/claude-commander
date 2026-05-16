import { describe, expect, it } from "vitest";
import { findVariables, renderTemplate, renderTemplateSync } from "../src/templates/engine";
import { VariableContext } from "../src/templates/types";

describe("findVariables", () => {
  it("returns empty array for plain text", () => {
    expect(findVariables("hello world")).toEqual([]);
  });

  it("extracts single variable", () => {
    expect(findVariables("{{file}} is here")).toEqual(["file"]);
  });

  it("deduplicates repeats", () => {
    expect(findVariables("{{file}} and {{file}}")).toEqual(["file"]);
  });

  it("handles spaces inside braces", () => {
    expect(findVariables("{{ file }}")).toEqual(["file"]);
  });

  it("collects multiple distinct vars", () => {
    const vars = findVariables("a {{file}} b {{selection}} c {{branch}}");
    expect(vars.sort()).toEqual(["branch", "file", "selection"]);
  });
});

describe("renderTemplate (async)", () => {
  it("substitutes resolved values", async () => {
    const ctx: VariableContext = {
      file: async () => "/tmp/a.ts",
      selection: async () => "x = 1",
      gitDiff: async () => "",
      gitDiffStaged: async () => "",
      branch: async () => "main",
      cwd: async () => "/repo",
      lastCommit: async () => "",
      lineRange: async () => "5-10",
    };
    const out = await renderTemplate("file={{file}} branch={{branch}}", ctx);
    expect(out).toBe("file=/tmp/a.ts branch=main");
  });

  it("empty-string for unknown variables", async () => {
    const ctx = {} as VariableContext;
    const out = await renderTemplate("{{unknown}}!", ctx);
    expect(out).toBe("!");
  });
});

describe("renderTemplateSync", () => {
  it("substitutes from values map", () => {
    expect(renderTemplateSync("hi {{name}}", { name: "소연" })).toBe("hi 소연");
  });
});
