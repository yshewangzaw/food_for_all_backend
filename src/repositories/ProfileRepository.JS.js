const { User, Notification, KycDocument } = require("../models");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");
const qualificationRepository = require("./qualificationRepository");

const SAFE_ATTRS = [
  "id", "fullName", "email", "phone", "role", "referralCode", "qrImageUrl",
  "sponsorId", "depth", "directReferralCount", "status", "activatedAt",
  "phoneVerifiedAt", "kycStatus", "city", "wallet", "lockedBalance",
  "address", "avatarUrl", "createdAt",
];

// Fields a member may change about themselves. Everything else — role,
// status, referralCode, wallet, sponsorId — is off limits no matter what
// the request body contains.
const SELF_EDITABLE = ["fullName", "city", "address", "avatarUrl"];

const profileRepository = {
  getMe: async (userId) => {
    const user = await User.findByPk(userId, {
      attributes: SAFE_ATTRS,
      include: [
        {
          model: User,
          as: "sponsor",
          attributes: ["id", "fullName", "referralCode", "phone"],
          required: false,
        },
      ],
    });
    if (!user) throw new Error("User not found");

    const qualification = await qualificationRepository.getStatus(userId);
    return { ...user.toJSON(), qualification };
  },

  updateMe: async (userId, body) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const patch = {};
    for (const f of SELF_EDITABLE) {
      if (body[f] !== undefined) patch[f] = body[f];
    }
    if (Object.keys(patch).length === 0) {
      throw new Error("No editable fields supplied");
    }

    await user.update(patch);
    return await User.findByPk(userId, { attributes: SAFE_ATTRS });
  },

  changePassword: async (userId, { currentPassword, newPassword }) => {
    if (!currentPassword || !newPassword) {
      throw new Error("currentPassword and newPassword are required");
    }
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) throw new Error("Current password is incorrect");

    const hash = await bcrypt.hash(newPassword, 10);
    // invalidate the refresh token so other sessions are logged out
    await user.update({ passwordHash: hash, refreshTokenHash: null });

    return { changed: true, sessionsInvalidated: true };
  },

  setAvatar: async (userId, avatarUrl) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
    await user.update({ avatarUrl });
    return { avatarUrl };
  },

  getReferralLink: async (userId) => {
    const user = await User.findByPk(userId, {
      attributes: ["id", "referralCode", "qrImageUrl", "status"],
    });
    if (!user) throw new Error("User not found");

    const base = process.env.APP_BASE_URL || "http://localhost:3000";
    const link = `${base}/register?ref=${user.referralCode}`;

    return {
      referralCode: user.referralCode,
      referralLink: link,
      qrImageUrl: user.qrImageUrl,
      // an inactive sponsor's link should not be handed out
      shareable: user.status === "ACTIVE",
    };
  },

  // ---------- admin: status ----------
  setStatus: async (userId, { status, reason }, adminId) => {
    const VALID = ["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"];
    if (!VALID.includes(status)) {
      throw new Error(`status must be one of ${VALID.join(", ")}`);
    }
    if (["SUSPENDED", "BLOCKED"].includes(status) && !reason) {
      throw new Error("A reason is required when suspending or blocking");
    }

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
    if (user.role === "ADMIN" && status === "BLOCKED") {
      throw new Error("Cannot block an admin account");
    }

    const previous = user.status;

    const t = await sequelize.transaction();
    try {
      await user.update({ status }, { transaction: t });

      await Notification.create(
        {
          userId,
          category: "SYSTEM",
          title: "Account status changed",
          body: reason
            ? `Your account status changed from ${previous} to ${status}. Reason: ${reason}`
            : `Your account status changed from ${previous} to ${status}.`,
          isRead: false,
        },
        { transaction: t },
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    return {
      userId: Number(userId),
      previousStatus: previous,
      status,
      reason: reason || null,
      changedBy: adminId,
    };
  },

  // Manual activation with no package payment. Edge case only.
  activate: async (userId, reason, adminId) => {
    if (!reason || !reason.trim()) {
      throw new Error("A reason is required for manual activation");
    }
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
    if (user.activatedAt) throw new Error("User is already activated");

    const t = await sequelize.transaction();
    try {
      await user.update(
        { status: "ACTIVE", activatedAt: new Date() },
        { transaction: t },
      );

      await qualificationRepository.record(
        { userId, orderId: null, pv: 0 },
        t,
      );

      await Notification.create(
        {
          userId,
          category: "SYSTEM",
          title: "Account activated",
          body: "Your account has been activated by an administrator.",
          isRead: false,
        },
        { transaction: t },
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    return {
      userId: Number(userId),
      activatedAt: new Date(),
      manual: true,
      reason,
      activatedBy: adminId,
    };
  },

  // ---------- KYC ----------
  submitKyc: async (userId, data) => {
    if (!data.documentType || !data.documentNumber || !data.frontImageUrl) {
      throw new Error(
        "documentType, documentNumber and frontImageUrl are required",
      );
    }

    const existing = await KycDocument.findOne({
      where: { userId, status: "PENDING" },
    });
    if (existing) throw new Error("You already have a KYC submission under review");

    const t = await sequelize.transaction();
    try {
      const doc = await KycDocument.create(
        {
          userId,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          frontImageUrl: data.frontImageUrl,
          backImageUrl: data.backImageUrl || null,
          selfieImageUrl: data.selfieImageUrl || null,
          status: "PENDING",
        },
        { transaction: t },
      );

      await User.update(
        { kycStatus: "PENDING" },
        { where: { id: userId }, transaction: t },
      );

      await t.commit();
      return doc;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  approveKyc: async (docId, adminId) => {
    const t = await sequelize.transaction();
    try {
      const doc = await KycDocument.findByPk(docId, { transaction: t });
      if (!doc) throw new Error("KYC document not found");
      if (doc.status !== "PENDING") {
        throw new Error(`Cannot approve a document with status ${doc.status}`);
      }

      await doc.update(
        { status: "APPROVED", rejectionReason: null },
        { transaction: t },
      );

      await User.update(
        { kycStatus: "APPROVED" },
        { where: { id: doc.userId }, transaction: t },
      );

      await Notification.create(
        {
          userId: doc.userId,
          category: "KYC",
          title: "KYC approved",
          body: "Your identity documents were approved. You can now request withdrawals.",
          isRead: false,
        },
        { transaction: t },
      );

      await t.commit();
      return doc;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  rejectKyc: async (docId, adminId, reason) => {
    if (!reason || !reason.trim()) {
      throw new Error("A rejection reason is required");
    }

    const t = await sequelize.transaction();
    try {
      const doc = await KycDocument.findByPk(docId, { transaction: t });
      if (!doc) throw new Error("KYC document not found");
      if (doc.status !== "PENDING") {
        throw new Error(`Cannot reject a document with status ${doc.status}`);
      }

      await doc.update(
        { status: "REJECTED", rejectionReason: reason.trim() },
        { transaction: t },
      );

      await User.update(
        { kycStatus: "REJECTED" },
        { where: { id: doc.userId }, transaction: t },
      );

      await Notification.create(
        {
          userId: doc.userId,
          category: "KYC",
          title: "KYC rejected",
          body: `Your identity documents were rejected. Reason: ${reason.trim()}. Please resubmit.`,
          isRead: false,
        },
        { transaction: t },
      );

      await t.commit();
      return doc;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  getKycQueue: async () => {
    return await KycDocument.findAll({
      where: { status: "PENDING" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email", "phone", "city"],
        },
      ],
      order: [["createdAt", "ASC"]], // oldest first
    });
  },
};

module.exports = profileRepository;