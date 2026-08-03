const express = require("express");
const router = express.Router();
const c = require("../controllers/authSessionController");
const requireAuth = require("../middleware/requireAuth");

router.post("/auth/login", c.login);
router.post("/auth/refresh", c.refresh);
router.post("/auth/logout", requireAuth, c.logout);
router.post("/auth/forgot-password", c.forgotPassword);
router.post("/auth/reset-password", c.resetPassword);
router.post("/auth/otp/send", requireAuth, c.sendOtp);
router.post("/auth/otp/verify", requireAuth, c.verifyOtp);
router.get("/referral/validate/:code", c.validateReferral);

module.exports = router;