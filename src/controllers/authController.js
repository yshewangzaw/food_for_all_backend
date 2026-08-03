const authService = require("../services/authService");
const jwt = require("jsonwebtoken");

const authController = {
  register: async (req, res) => {
    try {
      const user = await authService.register(req.body);

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          referralCode: user.referralCode,
          sponsorId: user.sponsorId,
          depth: user.depth,
          status: user.status,
        },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const result = await authService.login(req.body);
      const token = jwt.sign(
        { id: result.user.id, email: result.user.email, role: result.user.role },
        process.env.JWT_SECRET || "your_secret_key",
        { expiresIn: "7d" },
      );

      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            fullName: result.user.fullName,
            email: result.user.email,
            role: result.user.role,
            status: result.user.status,
          },
          token,
        },
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  },
};

module.exports = authController;