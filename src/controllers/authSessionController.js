const authSessionService = require("../services/authSessionService");

const authSessionController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await authSessionService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  },

  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await authSessionService.refresh(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      // req.user is expected to be set by your auth middleware after verifying the access token
      await authSessionService.logout(req.user.id);
      res.json({ success: true, message: "Logged out" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const identifier = req.body.identifier ?? req.body.email ?? req.body.phone;
      const result = await authSessionService.forgotPassword(identifier);
      const message = result?.method === "sms"
        ? "A reset verification has been sent to your phone."
        : "A reset verification has been sent to your email.";
      res.json({
        success: true,
        message,
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
      await authSessionService.resetPassword(email, token, newPassword);
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  sendOtp: async (req, res) => {
    try {
      await authSessionService.sendOtp(req.user.id);
      res.json({ success: true, message: "OTP sent" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { otp } = req.body;
      await authSessionService.verifyOtp(req.user.id, otp);
      res.json({ success: true, message: "Phone verified" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  validateReferral: async (req, res) => {
    try {
      const result = await authSessionService.validateReferral(req.params.code);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = authSessionController;