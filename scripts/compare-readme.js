const fs = require("fs");
const path = require("path");

const readmeFile = path.join(__dirname, "README.md");
if (fs.existsSync(readmeFile)) {
  console.log("README found at scripts/README.md (unexpected)");
}
console.log("COMPARE-README CHECK START");

const root = path.join(__dirname, "..", "src", "routes");
const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".js") || f.endsWith(".JS"));
const implemented = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(root, f), "utf8");
  const re = /router\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    implemented.push(`${m[1].toUpperCase()} ${m[2]}`);
  }
}
console.log("TOTAL implemented route defs:", implemented.length);

const wanted = [
  "GET /users/:id/regenerate-qr",
  "GET /network/:userId/path-to/:descendantId",
  "GET /network/leaderboard/recruiters",
  "GET /network/:userId/export",
  "POST /admin/users/:id/move",
  "POST /kyc/:id/resubmit",
  "GET /wallet-transactions/:id/user",
  "GET /reports/audit/admin-actions",
  "GET /me/reports/statement",
  "GET /me/qualification-status",
  "POST /users/:id/regenerate-qr",
  "GET /users/:id/qualification-status",
  "GET /me/dashboard",
  "POST /commissions/:id/credit",
  "GET /admin/network/integrity-check",
  "POST /admin/network/rebuild",
  "POST /admin/network/rebuild/:userId",
  "POST /jobs/qualification-reminder",
  "GET /payments/queue",
  "GET /payments/check-reference",
  "POST /payments/bulk-approve",
  "GET /me/notifications/unread-count",
  "POST /admin/notifications/broadcast",
  "GET /admin/notifications/delivery-stats",
  "GET /admin/wallet/reconcile",
  "GET /admin/wallet/liability",
  "POST /admin/wallet/adjustments",
  "GET /me/withdrawals/eligibility",
  "GET /withdrawals/payout-batch",
  "POST /withdrawals/bulk-mark-paid",
];

const norm = (r) => r.trim().replace(/\/+$/, "");
const implSet = new Set(implemented.map(norm));

let missing = 0;
for (const r of wanted) {
  const found = implSet.has(norm(r));
  console.log((found ? "OK    " : "MISS  ") + r);
  if (!found) missing++;
}
console.log("\nChecked:", wanted.length, "Missing:", missing);
