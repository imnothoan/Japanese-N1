import fs from "node:fs";
import path from "node:path";

const [,, sourcePath, table] = process.argv;

if (!sourcePath || !table) {
  console.error("Usage: node scripts/import-content.mjs <file.json> <table>");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(path.resolve(sourcePath), "utf-8"));
if (!Array.isArray(payload)) {
  console.error("Input must be an array of records.");
  process.exit(1);
}

const out = payload.map((row) => JSON.stringify(row)).join("\n");
const outputPath = path.resolve("data/import", `${table}.ndjson`);
fs.writeFileSync(outputPath, out);
console.log(`Prepared ${payload.length} records for ${table} at ${outputPath}`);
console.log("Next step: bulk load via Supabase SQL editor or COPY command.");
