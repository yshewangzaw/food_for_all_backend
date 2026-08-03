const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src");

const listFiles = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => path.basename(f)) : [];

const normalize = (name) =>
  name.toLowerCase().replace(/\.js$/i, "").replace(/\.$/i, "");

const repoNames = listFiles(path.join(root, "repositories"));
const serviceNames = listFiles(path.join(root, "services"));
const controllerNames = listFiles(path.join(root, "controllers"));
const routeNames = listFiles(path.join(root, "routes"));

const repoSet = new Set(repoNames.map(normalize));
const serviceSet = new Set(serviceNames.map(normalize));
const controllerSet = new Set(controllerNames.map(normalize));
const routeSet = new Set(routeNames.map(normalize));

const findRefs = (filePath) => {
  const c = fs.readFileSync(filePath, "utf8");
  const refs = [];
  const re =
    /require\(\s*["'](?:\.\.?\/)+(repositories|services|controllers|routes)\/([^"']+)["']\s*\)/g;
  let m;
  while ((m = re.exec(c)) !== null) {
    refs.push([m[1], m[2]]);
  }
  return refs;
};

const check = (kind, file) => {
  const modelDir = path.join(root, kind);
  const filePath = path.join(modelDir, file);
  const refs = findRefs(filePath);
  const missing = [];
  for (const [k, name] of refs) {
    let set;
    if (k === "repositories") set = repoSet;
    else if (k === "services") set = serviceSet;
    else if (k === "controllers") set = controllerSet;
    else if (k === "routes") set = routeSet;
    if (!set.has(normalize(name))) {
      missing.push(`  ${k}/${name}`);
    }
  }
  return missing;
};

const filesToCheck = [];

// Route files that app.js actually loads
const wiredRoutes = [
  "profileRoutes.js",
  "userRelationshipRoutes.js",
  "networkRelationshipRoutes.js",
  "networkBusinessRoutes.js",
  "networkAdminRoutes.js",
  "networkFilterRoutes.js",
  "networkPathRoutes.js",
  "productExtendedRoutes.js",
  "packageExtendedRoutes.js",
  "packageItemExtendedRoutes.js",
  "orderExtendedRoutes.js",
  "walletExtendedRoutes.js",
  "levelConfigExtendedRoutes.js",
  "commissionRuleExtendedRoutes.js",
  "commissionExtendedRoutes.js",
  "paymentMethodExtendedRoutes.js",
  "paymentExtendedRoutes.js",
  "withdrawalExtendedRoutes.js",
  "notificationExtendedRoutes.js",
  "reportRoutes.js",
  "jobRoutes.js",
  "userRoutes.js",
  "productRoutes.js",
  "packageRoutes.js",
  "packageItemRoutes.js",
  "orderRoutes.js",
  "orderItemRoutes.js",
  "commissionRoutes.js",
  "commissionRuleRoutes.js",
  "levelConfigurationRoutes.js",
  "paymentMethodRoutes.js",
  "paymentRoutes.js",
  "withdrawalRequestRoutes.js",
  "walletTransactionRoutes.js",
  "notificationRoutes.js",
  "kycRoutes.js",
  "authSessionRoutes.js",
];

wiredRoutes.forEach((r) => filesToCheck.push(["routes", r]));

// Controllers loaded by those routes
const controllers = listFiles(path.join(root, "controllers"));
controllers.forEach((c) => filesToCheck.push(["controllers", c]));

// Services & repositories in .js.js files (the implementation)
serviceNames
  .filter((s) => s.includes(".js.js"))
  .forEach((s) => filesToCheck.push(["services", s]));

repoNames
  .filter((r) => r.includes(".js.js"))
  .forEach((r) => filesToCheck.push(["repositories", r]));

let report = [];
for (const [kind, file] of filesToCheck) {
  const missing = check(kind, file);
  if (missing.length) {
    report.push(`${kind}/${file}:\n${missing.join("\n")}`);
  }
}

console.log(report.length ? report.join("\n\n") : "ALL DEPENDENCIES RESOLVE");
