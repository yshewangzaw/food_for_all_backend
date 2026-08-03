const express = require("express");
const router = express.Router();
const orderItemController = require("../controllers/orderItemController");

router.get("/", orderItemController.getAll);
router.get("/order/:orderId", orderItemController.getByOrderId);
router.get("/:id", orderItemController.getOne);
router.post("/", orderItemController.create);
router.put("/:id", orderItemController.update);
router.delete("/:id", orderItemController.delete);

module.exports = router;