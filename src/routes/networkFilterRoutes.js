const express = require("express");
const router = express.Router();
const c = require("../controllers/networkFilterController");

router.get("/network-paths", c.findNetworkPaths);

module.exports = router;