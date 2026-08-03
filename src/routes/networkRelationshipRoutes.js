const express = require("express");
const router = express.Router();
const c = require("../controllers/networkRelationshipController");

router.get("/network/:userId/ancestors", c.getAncestors);
router.get("/network/:userId/descendants", c.getDescendants);
router.get("/network/:userId/level/:level", c.getAtLevel);
router.get("/network/:userId/relationship/:otherId", c.getRelationship);

module.exports = router;