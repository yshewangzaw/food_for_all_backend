const express = require("express");
const router = express.Router();
const c = require("../controllers/commissionRuleExtendedController");

// Static path before /:id routes
router.get("/commission-rules/active", c.getActiveRules);
router.post("/commission-rules/simulate", c.simulate);
router.get("/commission-rules/validate", c.validate);

router.get(
  "/commission-rules/:id/level-configuration",
  c.getLevelConfiguration,
);
router.get("/commission-rules/:id/commissions", c.getCommissions);
router.patch("/commission-rules/:id/activate", c.activate);
router.patch("/commission-rules/:id/deactivate", c.deactivate);

module.exports = router;
