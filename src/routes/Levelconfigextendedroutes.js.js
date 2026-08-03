const express = require("express");
const router = express.Router();
const c = require("../controllers/levelConfigExtendedController");

// Static path before /:id routes
router.get("/level-configurations/active", c.getActive);

router.get("/level-configurations/:id/rules", c.getRules);
router.post("/level-configurations/:id/activate", c.activate);
router.patch("/level-configurations/:id/deactivate", c.deactivate);
router.post("/level-configurations/:id/clone", c.clone);

module.exports = router;
