import { describe, expect, it } from "vitest";
import { toWslPath, maybeConvertPath, getPlatform } from "../src/platform";

describe("toWslPath", () => {
  it("converts C:\\Users\\foo to /mnt/c/Users/foo", () => {
    expect(toWslPath("C:\\Users\\foo")).toBe("/mnt/c/Users/foo");
  });

  it("normalizes mixed slashes", () => {
    expect(toWslPath("D:/work\\repo/src")).toBe("/mnt/d/work/repo/src");
  });

  it("lowercases the drive letter", () => {
    expect(toWslPath("E:\\Code")).toBe("/mnt/e/Code");
  });

  it("returns input untouched when not a Windows path", () => {
    expect(toWslPath("/home/jake/repo")).toBe("/home/jake/repo");
    expect(toWslPath("./relative")).toBe("./relative");
    expect(toWslPath("")).toBe("");
  });
});

describe("maybeConvertPath", () => {
  it("does NOT convert on non-WSL platforms", () => {
    expect(maybeConvertPath("C:\\foo", "macos")).toBe("C:\\foo");
    expect(maybeConvertPath("C:\\foo", "linux")).toBe("C:\\foo");
    expect(maybeConvertPath("C:\\foo", "windows")).toBe("C:\\foo");
  });

  it("converts on WSL platform", () => {
    expect(maybeConvertPath("C:\\foo", "wsl")).toBe("/mnt/c/foo");
  });
});

describe("getPlatform", () => {
  it("returns one of the known platforms", () => {
    expect(["macos", "wsl", "linux", "windows"]).toContain(getPlatform());
  });
});
