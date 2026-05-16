// Manual smoke test: runs the real scanners against the actual filesystem.
// Run with: npx tsx test/indexer.smoke.ts
import { buildIndex } from "../src/explorer/indexer";

(async () => {
  const idx = await buildIndex();
  console.log(`Total entries: ${idx.entries.length}`);
  console.log(`Categories: ${idx.categories.length}`);
  for (const cat of idx.categories) {
    console.log(`\n=== ${cat.label} (${cat.entries.length}) ===`);
    for (const e of cat.entries.slice(0, 5)) {
      const desc = (e.descriptionKo ?? e.description ?? "").slice(0, 60);
      console.log(`  ${e.slash.padEnd(40)} ${desc}`);
    }
    if (cat.entries.length > 5) {
      console.log(`  … +${cat.entries.length - 5} more`);
    }
  }
})();
