const { Notification, User, NetworkPath } = require("../models");
const sequelize = require("../config/database");
const { Op, QueryTypes } = require("sequelize");
const { getPagination, buildMeta } = require("../utils/pagination");

const notificationExtendedRepository = {
  // ---------- relationship ----------
  getUser: async (id) => {
    const n = await Notification.findByPk(id);
    if (!n) throw new Error("Notification not found");
    return await User.findByPk(n.userId, {
      attributes: ["id", "fullName", "email", "phone"],
    });
  },

  // ---------- member feed ----------
  getFeed: async (userId, q = {}) => {
    const { page, limit, offset } = getPagination(q);
    const where = { userId };

    if (q.category) where.category = q.category;
    if (q.isRead !== undefined) {
      where.isRead = q.isRead === "true" || q.isRead === true;
    }
    if (q.dateFrom || q.dateTo) {
      where.createdAt = {};
      if (q.dateFrom) where.createdAt[Op.gte] = new Date(q.dateFrom);
      if (q.dateTo) where.createdAt[Op.lte] = new Date(q.dateTo);
    }

    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return { data: rows, meta: buildMeta({ count, page, limit }) };
  },

  // This gets polled, so keep it a single COUNT with no joins.
  getUnreadCount: async (userId) => {
    const total = await Notification.count({ where: { userId, isRead: false } });

    const byCategory = await Notification.findAll({
      where: { userId, isRead: false },
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["category"],
      raw: true,
    });

    return {
      total,
      byCategory: byCategory.reduce(
        (acc, r) => ({ ...acc, [r.category]: Number(r.count) }),
        {},
      ),
    };
  },

  markRead: async (id, userId) => {
    const n = await Notification.findByPk(id);
    if (!n) throw new Error("Notification not found");
    if (n.userId !== userId) throw new Error("This is not your notification");
    if (n.isRead) return n;

    await n.update({ isRead: true, readAt: new Date() });
    return n;
  },

  markAllRead: async (userId, category) => {
    const where = { userId, isRead: false };
    if (category) where.category = category;

    const [affected] = await Notification.update(
      { isRead: true, readAt: new Date() },
      { where },
    );
    return { updated: affected };
  },

  dismiss: async (id, userId) => {
    const n = await Notification.findByPk(id);
    if (!n) throw new Error("Notification not found");
    if (n.userId !== userId) throw new Error("This is not your notification");
    await n.destroy();
    return { id, dismissed: true };
  },

  // ---------- admin sending ----------
  sendToUser: async ({ userId, category, title, body, linkUrl }) => {
    if (!title || !body) throw new Error("title and body are required");
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    return await Notification.create({
      userId,
      category: category || "SYSTEM",
      title,
      body,
      linkUrl: linkUrl || null,
      isRead: false,
    });
  },

  /**
   * Segmented broadcast. `segment` narrows the audience:
   *   { status, city, kycStatus, depth, minDepth, maxDepth,
   *     role, activated, underUserId, level }
   *
   * underUserId + level target a specific member's downline via the
   * closure table — that is how a sponsor-wide announcement is sent.
   */
  broadcast: async ({ category, title, body, linkUrl, segment = {} }) => {
    if (!title || !body) throw new Error("title and body are required");

    const where = {};
    if (segment.status) where.status = segment.status;
    if (segment.city) where.city = segment.city;
    if (segment.kycStatus) where.kycStatus = segment.kycStatus;
    if (segment.role) where.role = segment.role;
    if (segment.depth !== undefined) where.depth = segment.depth;
    if (segment.minDepth !== undefined || segment.maxDepth !== undefined) {
      where.depth = {};
      if (segment.minDepth !== undefined) where.depth[Op.gte] = segment.minDepth;
      if (segment.maxDepth !== undefined) where.depth[Op.lte] = segment.maxDepth;
    }
    if (segment.activated !== undefined) {
      where.activatedAt = segment.activated
        ? { [Op.ne]: null }
        : { [Op.is]: null };
    }

    // downline targeting
    if (segment.underUserId) {
      const pathWhere = {
        ancestorId: segment.underUserId,
        level: { [Op.gt]: 0 },
      };
      if (segment.level) pathWhere.level = segment.level;

      const paths = await NetworkPath.findAll({
        where: pathWhere,
        attributes: ["descendantId"],
        raw: true,
      });
      const ids = paths.map((p) => p.descendantId);
      if (ids.length === 0) return { sent: 0, recipients: [] };
      where.id = { [Op.in]: ids };
    }

    const users = await User.findAll({ where, attributes: ["id"], raw: true });
    if (users.length === 0) return { sent: 0, recipients: [] };

    // bulkCreate in chunks — a 50k-member broadcast in one INSERT will
    // exceed max_allowed_packet.
    const CHUNK = 1000;
    let sent = 0;
    for (let i = 0; i < users.length; i += CHUNK) {
      const chunk = users.slice(i, i + CHUNK).map((u) => ({
        userId: u.id,
        category: category || "NEWS",
        title,
        body,
        linkUrl: linkUrl || null,
        isRead: false,
      }));
      await Notification.bulkCreate(chunk);
      sent += chunk.length;
    }

    return { sent, segment };
  },

  resendEmail: async (id) => {
    const n = await Notification.findByPk(id);
    if (!n) throw new Error("Notification not found");

    // Plug your mail provider in here. Until then the timestamp records
    // that a send was attempted, which is what the retry job reads.
    await n.update({ emailSentAt: new Date() });
    return n;
  },

  // ---------- admin stats ----------
  getDeliveryStats: async ({ category, dateFrom, dateTo } = {}) => {
    const replacements = {
      category: category || null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    };

    const rows = await sequelize.query(
      `SELECT category,
              COUNT(*)                                            AS total,
              SUM(CASE WHEN isRead = 1 THEN 1 ELSE 0 END)         AS readCount,
              SUM(CASE WHEN emailSentAt IS NOT NULL THEN 1 ELSE 0 END) AS emailSent
         FROM notifications
        WHERE (:category IS NULL OR category = :category)
          AND (:dateFrom IS NULL OR createdAt >= :dateFrom)
          AND (:dateTo   IS NULL OR createdAt <= :dateTo)
        GROUP BY category`,
      { replacements, type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      category: r.category,
      total: Number(r.total),
      read: Number(r.readCount),
      unread: Number(r.total) - Number(r.readCount),
      readRate: r.total > 0 ? Number(r.readCount) / Number(r.total) : 0,
      emailSent: Number(r.emailSent),
      emailPending: Number(r.total) - Number(r.emailSent),
    }));
  },

  // ---------- filter (spec 7.3) ----------
  findFiltered: async (q) => {
    const { page, limit, offset } = getPagination(q);
    const where = {};

    if (q.userId) where.userId = q.userId;
    if (q.category) where.category = q.category;
    if (q.isRead !== undefined) {
      where.isRead = q.isRead === "true" || q.isRead === true;
    }
    if (q.emailSent !== undefined) {
      const sent = q.emailSent === "true" || q.emailSent === true;
      where.emailSentAt = sent ? { [Op.ne]: null } : { [Op.is]: null };
    }
    if (q.dateFrom || q.dateTo) {
      where.createdAt = {};
      if (q.dateFrom) where.createdAt[Op.gte] = new Date(q.dateFrom);
      if (q.dateTo) where.createdAt[Op.lte] = new Date(q.dateTo);
    }
    if (q.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q.search}%` } },
        { body: { [Op.like]: `%${q.search}%` } },
      ];
    }

    const sort = ["createdAt", "readAt"].includes(q.sort) ? q.sort : "createdAt";
    const order = String(q.order).toLowerCase() === "asc" ? "ASC" : "DESC";

    const { rows, count } = await Notification.findAndCountAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
      ],
      order: [[sort, order]],
      limit,
      offset,
      distinct: true,
    });

    return { data: rows, meta: buildMeta({ count, page, limit }) };
  },
};

module.exports = notificationExtendedRepository;