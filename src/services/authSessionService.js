const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const { User } = require("../models");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { generateOtp, generateResetToken } = require("../utils/tokenUtils");

const sendEmail = async (to, subject, body) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!host || !user || !pass) {
    console.warn(`[EMAIL] SMTP credentials not configured. Message for ${to} was not sent.`);
    return { ok: false, reason: "missing-config" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text: body,
    });
    return { ok: true };
  } catch (error) {
    console.error(`[EMAIL] Delivery failed for ${to}:`, error.message);
    return { ok: false, reason: error.message };
  }
};

const sendSms = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn(`[SMS] Twilio credentials not configured. Message for ${to} was not sent.`);
    return { ok: false, reason: "missing-config" };
  }

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      from: fromNumber,
      to,
      body,
    });
    return { ok: true };
  } catch (error) {
    console.error(`[SMS] Delivery failed for ${to}:`, error.message);
    return { ok: false, reason: error.message };
  }
};

const authSessionService = {
  login: async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid email or password");

    if (user.status === "BLOCKED" || user.status === "SUSPENDED") {
      throw new Error(`Account is ${user.status.toLowerCase()}`);
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Store a hash of the refresh token so logout/refresh can validate it,
    // and a compromised token can be invalidated (requires the migration below)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.update({ refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  },

  refresh: async (refreshToken) => {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new Error("Invalid or expired refresh token");
    }

    const user = await User.findByPk(payload.id);
    if (!user || !user.refreshTokenHash) {
      throw new Error("Session no longer valid");
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new Error("Session no longer valid");

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await user.update({ refreshTokenHash: newRefreshTokenHash });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  logout: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
    await user.update({ refreshTokenHash: null });
    return true;
  },

  forgotPassword: async (identifier) => {
    const normalized = (identifier || "").trim();
    if (!normalized) {
      throw new Error("Please enter an email or phone number");
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: normalized }, { phone: normalized }],
      },
    });

    // Always respond success-shaped even if not found — don't leak which contacts exist
    if (!user) return { delivered: false, method: null };

    const resetToken = generateResetToken();
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await user.update({ resetTokenHash, resetTokenExpiresAt });

    const isPhoneInput = /^[+0-9\s()-]{6,20}$/.test(normalized);
    let method = isPhoneInput && user.phone ? "sms" : "email";
    let destination = method === "sms" ? user.phone : user.email;

    if (method === "sms") {
      const smsResult = await sendSms(
        destination,
        `Your Food for All reset code is ${resetToken}`
      );
      if (!smsResult?.ok) {
        method = "email";
        destination = user.email;
        console.warn(`[AUTH] SMS delivery failed for ${user.email}; falling back to email.`);
      }
    }

    await sendEmail(
      destination,
      "Reset your Food for All password",
      `Use this token to reset your password: ${resetToken} (expires in 30 minutes)`
    );

    return { delivered: true, method, destination, resetToken };
  },

  resetPassword: async (email, token, newPassword) => {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
      throw new Error("Invalid or expired reset token");
    }

    if (new Date() > new Date(user.resetTokenExpiresAt)) {
      throw new Error("Reset token has expired");
    }

    const matches = await bcrypt.compare(token, user.resetTokenHash);
    if (!matches) throw new Error("Invalid or expired reset token");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await user.update({
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      refreshTokenHash: null, // force re-login everywhere after a password reset
    });

    return true;
  },

  sendOtp: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await user.update({ otpHash, otpExpiresAt });
    await sendSms(user.phone, `Your Food for All verification code is ${otp}`);

    return true;
  },

  verifyOtp: async (userId, otp) => {
    const user = await User.findByPk(userId);
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      throw new Error("No OTP pending for this account");
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      throw new Error("OTP has expired");
    }

    const matches = await bcrypt.compare(otp, user.otpHash);
    if (!matches) throw new Error("Incorrect OTP");

    await user.update({
      phoneVerifiedAt: new Date(),
      otpHash: null,
      otpExpiresAt: null,
    });

    return true;
  },

  validateReferral: async (referralCode) => {
    const sponsor = await User.findOne({ where: { referralCode } });
    if (!sponsor) {
      return { valid: false };
    }
    return {
      valid: true,
      sponsorActive: sponsor.status === "ACTIVE",
      sponsorName: sponsor.fullName,
    };
  },
};

module.exports = authSessionService;