const express = require("express");
const router = express.Router();
const c = require("../controllers/productExtendedController");
const { imageUpload, catalogUpload } = require("../middleware/uploadMiddleware");

// IMPORTANT: static paths (categories, bulk-import) must be registered
// BEFORE any /products/:id route — otherwise Express matches "categories"
// or "bulk-import" as if they were an :id value.
router.get("/products/categories", c.getCategories);
router.post("/products/bulk-import", catalogUpload.single("file"), c.bulkImport);

router.get("/products/:id/packages", c.getPackagesContaining);
router.get("/products/:id/order-items", c.getOrderItems);
router.patch("/products/:id/activate", c.activate);
router.patch("/products/:id/deactivate", c.deactivate);
router.post("/products/:id/image", imageUpload.single("image"), c.uploadImage);
router.get("/products/:id/sales-stats", c.getSalesStats);

module.exports = router;
