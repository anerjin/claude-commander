import { describe, expect, it } from "vitest";
import { getBuiltinTemplates } from "../src/templates/catalog";
import { findVariables } from "../src/templates/engine";

const KNOWN_VARS = new Set([
  "file",
  "selection",
  "gitDiff",
  "gitDiffStaged",
  "branch",
  "cwd",
  "lastCommit",
  "lineRange",
]);

describe("getBuiltinTemplates", () => {
  it("returns at least 10 templates", () => {
    expect(getBuiltinTemplates().length).toBeGreaterThanOrEqual(10);
  });

  it("every template has Korean name + non-empty body", () => {
    for (const t of getBuiltinTemplates()) {
      expect(t.name).toBeTruthy();
      expect(t.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("every template variable is in the known set", () => {
    for (const t of getBuiltinTemplates()) {
      for (const v of findVariables(t.body)) {
        expect(KNOWN_VARS.has(v), `${t.name} uses unknown var {{${v}}}`).toBe(true);
      }
    }
  });

  it("ids are unique", () => {
    const ids = getBuiltinTemplates().map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
