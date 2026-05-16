import { describe, expect, it } from "vitest";
import { getBuiltinCommands } from "../src/explorer/catalog";

describe("getBuiltinCommands", () => {
  it("returns a non-empty list of slash commands", () => {
    const list = getBuiltinCommands();
    expect(list.length).toBeGreaterThan(10);
  });

  it("every entry has Korean description", () => {
    for (const e of getBuiltinCommands()) {
      expect(e.descriptionKo, `missing descriptionKo for ${e.slash}`).toBeTruthy();
    }
  });

  it("every slash starts with '/' and category is 'builtin'", () => {
    for (const e of getBuiltinCommands()) {
      expect(e.slash.startsWith("/")).toBe(true);
      expect(e.category).toBe("builtin");
      expect(e.source.kind).toBe("builtin");
    }
  });

  it("contains the most common commands", () => {
    const slashes = getBuiltinCommands().map((e) => e.slash);
    for (const must of ["/help", "/clear", "/model", "/cost", "/compact"]) {
      expect(slashes).toContain(must);
    }
  });
});
