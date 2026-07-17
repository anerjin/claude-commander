#!/usr/bin/env node
/**
 * sync-catalog.mjs — 내장 슬래시 명령 카탈로그 드리프트 점검 도구
 *
 * 내장 슬래시 명령은 `claude` 바이너리에 컴파일되어 있어 런타임 자동 수집이
 * 불가능하므로 `src/explorer/catalog.ts` 에 수기로 관리한다. 이 스크립트는
 * 설치된 `claude` 바이너리에서 명령 정의(`type:"local" | "local-jsx" | "prompt"`)를
 * 추출해 현재 카탈로그와 대조하고, 새로 생겼거나 사라진 명령을 리포트한다.
 *
 * 사용법:
 *   node scripts/sync-catalog.mjs            # 드리프트 리포트
 *   node scripts/sync-catalog.mjs --stubs    # 신규 명령의 catalog.ts 붙여넣기용 스텁 출력
 *   CLAUDE_BIN=/path/to/claude node scripts/sync-catalog.mjs
 *
 * 주의: 바이너리 문자열 추출은 휴리스틱이라 내부용/비공개 명령(stickers, radio,
 * voice, heapdump 등)도 함께 잡힐 수 있다. 리포트는 사람이 검토해 반영한다.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const CATALOG_PATH = path.join(root, "src", "explorer", "catalog.ts");

const COMMAND_TYPES = ["local", "local-jsx", "prompt"];
const NAME = "[a-z][a-z0-9-]{1,30}";

function findBinary() {
  const exe = process.platform === "win32" ? "claude.exe" : "claude";
  const candidates = [
    process.env.CLAUDE_BIN,
    path.join(os.homedir(), ".local", "bin", exe),
    path.join(os.homedir(), ".claude", "local", exe),
    "/usr/local/bin/claude",
    "/opt/homebrew/bin/claude",
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isFile()) return c;
    } catch {
      /* not here */
    }
  }
  return null;
}

/** Extract a small field (description/argumentHint) from a window of text. */
function field(win, key, max) {
  const re = new RegExp(`${key}:"((?:[^"\\\\]|\\\\.){0,${max}})"`);
  const m = win.match(re);
  return m ? m[1].replace(/\\u2192/g, "→").replace(/\\"/g, '"').replace(/\\\\/g, "\\") : "";
}

function extractCommands(binPath) {
  // latin1 keeps byte offsets stable for the ASCII JS string literals we match.
  const text = fs.readFileSync(binPath, "latin1");
  const found = new Map();
  const nameRe = new RegExp(`name:"(${NAME})"`, "g");

  // Description/argumentHint belong to the object the name introduces, so extract
  // them from a window anchored AT the name (fields follow the name), not from the
  // type token — otherwise a neighbouring object's description bleeds in.
  const record = (name, type, nameAbsPos) => {
    if (!name || found.has(name)) return;
    const fwin = text.slice(nameAbsPos, nameAbsPos + 240);
    found.set(name, {
      name,
      type,
      description: field(fwin, "description", 120) || field(fwin, "menuDescription", 120),
      argumentHint: field(fwin, "argumentHint", 60),
    });
  };

  // (A) Slash commands carry a `type:"local" | "local-jsx" | "prompt"` discriminator.
  // The `name:` field can sit before or after it with other fields between (aliases,
  // availability, isEnabled…), so anchor on the type token and take the *nearest*
  // name within a window — that survives arbitrary field ordering.
  const typeRe = new RegExp(`type:"(${COMMAND_TYPES.join("|")})"`, "g");
  let m;
  while ((m = typeRe.exec(text))) {
    const start = Math.max(0, m.index - 460);
    const win = text.slice(start, m.index + 160);
    const typePos = m.index - start;
    let best = null;
    let bestAbs = -1;
    let bestDist = Infinity;
    for (const nm of win.matchAll(nameRe)) {
      const d = Math.abs(nm.index - typePos);
      if (d < bestDist) {
        bestDist = d;
        best = nm[1];
        bestAbs = start + nm.index;
      }
    }
    record(best, m[1], bestAbs);
  }

  // (B) Bundled skills are registered as `{name:"x",description:"…",pluginName:…,
  // pluginCommand:"x"}` with no `type:` field — catch them via pluginCommand and
  // anchor on the nearest preceding name.
  const skillRe = /pluginCommand:"([a-z][a-z0-9-]{1,30})"/g;
  while ((m = skillRe.exec(text))) {
    const start = Math.max(0, m.index - 300);
    const win = text.slice(start, m.index);
    let lastAbs = -1;
    for (const nm of win.matchAll(nameRe)) lastAbs = start + nm.index;
    if (lastAbs >= 0) record(m[1], "skill", lastAbs);
  }

  return found;
}

function readCatalogSlashes() {
  const src = fs.readFileSync(CATALOG_PATH, "utf8");
  const set = new Set();
  for (const m of src.matchAll(/slash:\s*"\/([a-z0-9-]+)"/g)) set.add(m[1]);
  return set;
}

function main() {
  const bin = findBinary();
  if (!bin) {
    console.error("✖ claude 바이너리를 찾지 못했습니다. CLAUDE_BIN 환경변수로 경로를 지정하세요.");
    process.exit(2);
  }
  console.log(`● 바이너리: ${bin}`);

  const commands = extractCommands(bin);
  const catalog = readCatalogSlashes();
  console.log(`● 바이너리에서 추출한 명령: ${commands.size}개 · 카탈로그 등록: ${catalog.size}개\n`);

  const missing = [...commands.values()].filter((c) => !catalog.has(c.name));
  const stale = [...catalog].filter((name) => !commands.has(name));

  if (missing.length === 0) {
    console.log("✓ 카탈로그에 빠진 신규 명령 없음.");
  } else {
    console.log(`▶ 카탈로그에 없는 명령 ${missing.length}개 (신규 가능성 / 내부용 혼재):`);
    for (const c of missing.sort((a, b) => a.name.localeCompare(b.name))) {
      const hint = c.argumentHint ? `  arg=${JSON.stringify(c.argumentHint)}` : "";
      console.log(`   /${c.name}  [${c.type}]  ${c.description}${hint}`);
    }
  }

  console.log();
  if (stale.length === 0) {
    console.log("✓ 바이너리에 없는 카탈로그 항목 없음.");
  } else {
    console.log(`▶ 바이너리에서 못 찾은 카탈로그 항목 ${stale.length}개 (제거 후보 / 별칭·비-local 타입일 수 있음):`);
    console.log(`   ${stale.sort().map((n) => "/" + n).join("  ")}`);
  }

  if (process.argv.includes("--stubs") && missing.length) {
    console.log("\n--- catalog.ts 붙여넣기용 스텁 (한글 설명은 직접 채우세요) ---");
    for (const c of missing.sort((a, b) => a.name.localeCompare(b.name))) {
      const argField = c.argumentHint ? `, argumentHint: ${JSON.stringify(c.argumentHint)}` : "";
      const desc = c.description.replace(/"/g, '\\"');
      console.log(`  { slash: "/${c.name}", description: "${desc}", descriptionKo: "" ${argField} },`);
    }
  }
}

main();
