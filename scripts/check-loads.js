const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src");
const dirs = ["controllers", "services", "repositories"];

let failCount = 0;

for (const dir of dirs) {
  const full = path.join(root, dir);
  const files = fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".js") || f.endsWith(".JS"));
  for (const f of files) {
    try {
      require(path.join(full, f));
      console.log(`OK    ${dir}/${f}`);
    } catch (e) {
      failCount++;
      console.log(`FAIL  ${dir}/${f} :: ${e.message.split("\n")[0]}`);
    }
  }
}

console.log(
  failCount ? `\n${failCount} file(s) failed to load` : "\nAll files loaded",
);
process.exit(failCount ? 1 : 0);
