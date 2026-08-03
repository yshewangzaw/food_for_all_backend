const express = require("express");
const router = express.Router();
const c = require("../controllers/profileController");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/roleMiddleware");
const { imageUpload } = require("../middleware/uploadMiddleware");

const admin = [requireAuth, requireRole("ADMIN")];

// ---------- self (1.2) ----------
router.get("/me", requireAuth, c.getMe);
router.patch("/me", requireAuth, c.updateMe);
router.post("/me/change-password", requireAuth, c.changePassword);
router.post("/me/avatar", requireAuth, imageUpload.single("avatar"), c.setAvatar);
router.get("/me/referral-link", requireAuth, c.getReferralLink);
router.get("/me/qualification-status", requireAuth, c.getMyQualification);

// ---------- KYC ----------
// /kyc/queue is static and must precede /kyc/:id/*
router.get("/kyc/queue", admin, c.getKycQueue);
router.post(
  "/kyc/submit",
  requireAuth,
  imageUpload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  c.submitKyc,
);
router.post("/kyc/:id/approve", admin, c.approveKyc);
router.post("/kyc/:id/reject", admin, c.rejectKyc);

// ---------- admin acting on a member ----------
router.get("/users/:id/qualification-status", admin, c.getUserQualification);
router.patch("/users/:id/status", admin, c.setStatus);
router.post("/users/:id/activate", admin, c.activate);
router.post("/users/:id/qualification/grant", admin, c.grantQualification);
router.post("/users/:id/qualification/revoke", admin, c.revokeQualification);

module.exports = router;