const express = require("express");
const router = express.Router();
const c = require("../controllers/networkBusinessController");
const requireAuth = require("../middleware/requireAuth");

router.get("/network/:userId/tree", c.getTree);
router.get("/me/network/tree", requireAuth, c.getMyTree);
router.get("/network/:userId/stats", c.getStats);
router.get("/network/:userId/legs", c.getLegs);

module.exports = router;