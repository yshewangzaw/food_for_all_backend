const express = require("express");
const router = express.Router();
const c = require("../controllers/paymentMethodExtendedController");

router.get("/payment-methods/active", c.getActive);
router.get("/payment-methods/available", c.getAvailableForAmount);

router.get("/payment-methods/:id/payments", c.getPayments);
router.patch("/payment-methods/:id/activate", c.activate);
router.patch("/payment-methods/:id/deactivate", c.deactivate);

module.exports = router;
