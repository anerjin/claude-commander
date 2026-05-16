import * as fs from "node:fs";

export type Platform = "macos" | "wsl" | "linux" | "windows";

export function isMacOS(): boolean {
  return process.platform === "darwin";
}

export function isWSL(): boolean {
  if (process.env.WSL_DISTRO_NAME || process.env.WSLENV || process.env.WSL_INTEROP || process.env.IS_WSL) {
    return true;
  }
  if (process.platform !== "linux") {
    return false;
  }
  if (process.env.PATH?.includes("/mnt/")) {
    return true;
  }
  try {
    if (fs.existsSync("/proc/version")) {
      const version = fs.readFileSync("/proc/version", "utf8");
      return version.toLowerCase().includes("microsoft");
    }
  } catch {
    // ignore
  }
  return false;
}

export function getPlatform(): Platform {
  if (isMacOS()) return "macos";
  if (isWSL()) return "wsl";
  if (process.platform === "win32") return "windows";
  return "linux";
}

const WINDOWS_PATH_RE = /^([a-zA-Z]):[\\/](.*)$/;

export function toWslPath(input: string): string {
  const match = input.match(WINDOWS_PATH_RE);
  if (!match) return input;
  const drive = match[1].toLowerCase();
  const rest = match[2].replace(/\\/g, "/");
  return `/mnt/${drive}/${rest}`;
}

export function maybeConvertPath(input: string, platform: Platform = getPlatform()): string {
  if (platform !== "wsl") return input;
  return toWslPath(input);
}
