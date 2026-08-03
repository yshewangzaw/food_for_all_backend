const express = require("express");
const router = express.Router();
const c = require("../controllers/packageExtendedController");
const { imageUpload } = require("../middleware/uploadMiddleware");

// Static paths BEFORE dynamic /packages/:id paths
router.get("/packages/entry", c.getEntryPackage);
router.get("/packages/qualifying", c.getQualifyingPackages);
router.get("/packages/active", c.getActiveOn);

router.get("/packages/:id/items", c.getItems);
router.get("/packages/:id/orders", c.getOrders);
router.post("/packages/:id/supersede", c.supersede);
router.patch("/packages/:id/activate", c.activate);
router.patch("/packages/:id/deactivate", c.deactivate);
router.get("/packages/:id/computed-value", c.getComputedValue);
router.get("/packages/:id/sales-stats", c.getSalesStats);
router.post("/packages/:id/image", imageUpload.single("image"), c.uploadImage);

module.exports = router;