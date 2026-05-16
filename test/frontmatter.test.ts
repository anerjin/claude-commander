import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "../src/explorer/frontmatter";

describe("parseFrontmatter", () => {
  it("returns no frontmatter when delimiters absent", () => {
    const { data, body } = parseFrontmatter("just a body\nno frontmatter");
    expect(data).toEqual({});
    expect(body).toContain("just a body");
  });

  it("parses simple key:value", () => {
    const src = `---\nname: omc-plan\ndescription: Strategic planning\n---\nbody here`;
    const { data, body } = parseFrontmatter(src);
    expect(data.name).toBe("omc-plan");
    expect(data.description).toBe("Strategic planning");
    expect(body).toBe("body here");
  });

  it("strips wrapping quotes", () => {
    const src = `---\nargument-hint: "[--direct] <task>"\n---\n`;
    const { data } = parseFrontmatter(src);
    expect(data["argument-hint"]).toBe("[--direct] <task>");
  });

  it("parses block scalar with pipe", () => {
    const src = `---\ndescription: |\n  Line one\n  Line two\n---\n`;
    const { data } = parseFrontmatter(src);
    expect(data.description).toBe("Line one\nLine two");
  });

  it("parses list values", () => {
    const src = `---\ntriggers:\n  - codex review\n  - second opinion\n---\n`;
    const { data } = parseFrontmatter(src);
    expect(data.triggers).toEqual(["codex review", "second opinion"]);
  });

  it("returns body untouched if closing delimiter missing", () => {
    const src = `---\nname: foo\nbody without close`;
    const { data, body } = parseFrontmatter(src);
    expect(data).toEqual({});
    expect(body).toBe(src);
  });
});
