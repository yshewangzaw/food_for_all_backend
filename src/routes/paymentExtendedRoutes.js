const express = require("express");
const router = express.Router();
const c = require("../controllers/paymentExtendedController");
const requireAuth = require("../middleware/requireAuth");
const { imageUpload } = require("../middleware/uploadMiddleware");

// Static paths BEFORE /payments/:id
router.get("/payments/queue", requireAuth, c.getQueue);
router.get("/payments/check-reference", requireAuth, c.checkReference);
router.post("/payments/bulk-approve", requireAuth, c.bulkApprove);
router.post("/payments", requireAuth, imageUpload.single("proof"), c.create);

router.get("/payments/:id/order", c.getOrder);
router.get("/payments/:id/method", c.getMethod);
router.get("/payments/:id/user", c.getUser);
router.get("/payments/:id/reviewer", c.getReviewer);
router.post("/payments/:id/approve", requireAuth, c.approve);
router.post("/payments/:id/reject", requireAuth, c.reject);
router.post("/payments/:id/cancel", requireAuth, c.cancel);
router.post(
  "/payments/:id/resubmit-proof",
  requireAuth,
  imageUpload.single("proof"),
  c.resubmitProof,
);

module.exports = router;
