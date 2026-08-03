const express = require("express");
const router = express.Router();
const c = require("../controllers/networkAdminController");
const requireAuth = require("../middleware/requireAuth");

// NOTE: these are destructive/expensive operations — restricted to ADMIN role.
// requireAdmin checks req.user.role after requireAuth has run.
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

router.post("/admin/network/rebuild", requireAuth, requireAdmin, c.rebuildAll);
router.post("/admin/network/rebuild/:userId", requireAuth, requireAdmin, c.rebuildSubtree);
router.get("/admin/network/integrity-check", requireAuth, requireAdmin, c.integrityCheck);

module.exports = router;