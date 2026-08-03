const express = require("express");
const router = express.Router();
const c = require("../controllers/packageItemExtendedController");

router.post("/packages/:id/items", c.addItem);
router.patch("/packages/:id/items/:itemId", c.updateItemQuantity);
router.delete("/packages/:id/items/:itemId", c.removeItem);
router.put("/packages/:id/items", c.replaceAllItems);

router.get("/package-items/:id/product", c.getProductForItem);
router.get("/package-items/:id/package", c.getPackageForItem);

module.exports = router;