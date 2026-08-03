const express = require("express");
const router = express.Router();
const c = require("../controllers/orderExtendedController");
const requireAuth = require("../middleware/requireAuth");

// Static paths BEFORE /orders/:id
router.post("/orders/quote", c.quote);
router.post("/orders/checkout", requireAuth, c.checkout);
router.get("/orders/next-number", c.getNextOrderNumber);
router.get("/me/orders/current-month", requireAuth, c.getCurrentMonthOrder);

router.get("/orders/:id/items", c.getItems);
router.get("/orders/:id/payments", c.getPayments);
router.get("/orders/:id/commissions", c.getCommissions);
router.get("/orders/:id/buyer", c.getBuyer);
router.post("/orders/:id/cancel", c.cancel);
router.post("/orders/:id/refund", c.refund);
router.get("/orders/:id/invoice", c.getInvoice);
router.post("/admin/orders/:id/recalculate-pv", requireAuth, c.recalculatePv);

router.get("/order-items/:id/product", c.getOrderItemProduct);
router.get("/order-items/:id/package", c.getOrderItemPackage);

module.exports = router;
