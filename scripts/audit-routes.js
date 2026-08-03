const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src", "routes");

// Collect all route definitions from every route file (both wired and .js.js)
const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".js") || f.endsWith(".JS"));

const allRoutes = [];

for (const f of files) {
  const src = fs.readFileSync(path.join(root, f), "utf8");
  // Extract router.METHOD("path", handler) patterns
  const re = /router\.(get|post|put|patch|delete|use)\(\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    allRoutes.push({ file: f, method: m[1].toUpperCase(), path: m[2] });
  }
}

// Combine with the /api mount prefixes from app.js
const appSrc = fs.readFileSync(
  path.join(__dirname, "..", "src", "app.js"),
  "utf8",
);
const mounts = [];
const mountRe =
  /app\.use\(\s*["'](\/api[^"']*)["']\s*,\s*require\(["']([^"']+)["']\)/g;
let mm;
while ((mm = mountRe.exec(appSrc)) !== null) {
  mounts.push({ prefix: mm[1], file: mm[2].split("/").pop() });
}

console.log("=== ROUTE FILES MOUNTED IN app.js ===");
mounts.forEach(({ prefix, file }) => {
  console.log(`  ${prefix}  <-  ${file}`);
});

console.log("\n=== ALL ROUTE DEFINITIONS (by file) ===");
const byFile = {};
let total = 0;
for (const r of allRoutes) {
  byFile[r.file] = byFile[r.file] || [];
  byFile[r.file].push(`${r.method} ${r.path}`);
  total++;
}
Object.keys(byFile)
  .sort()
  .forEach((f) => {
    console.log(`\n[${f}] (${byFile[f].length})`);
    byFile[f].forEach((r) => console.log(`  ${r}`));
  });
console.log(`\nTOTAL route definitions: ${total}`);
