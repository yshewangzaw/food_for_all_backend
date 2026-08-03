const { NetworkPath, User, Order, OrderItem, Package } = require("../models");
const { Op } = require("sequelize");

const networkFilterRepository = {
  // GET /network-paths — raw filter over the closure table itself
  findNetworkPaths: async (query) => {
    const where = {};

    if (query.ancestorId) where.ancestorId = query.ancestorId;
    if (query.descendantId) where.descendantId = query.descendantId;
    if (query.level !== undefined) where.level = query.level;

    if (query.minLevel || query.maxLevel) {
      where.level = where.level || {};
      if (query.minLevel) where.level[Op.gte] = query.minLevel;
      if (query.maxLevel) where.level[Op.lte] = query.maxLevel;
    }

    if (query.type) where.type = query.type;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const offset = (page - 1) * limit;

    const { rows, count } = await NetworkPath.findAndCountAll({
      where,
      order: [["level", "ASC"]],
      limit,
      offset,
    });

    return {
      data: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  },

  // GET /network/:userId/descendants with the extended filter set
  findDescendantsFiltered: async (userId, query) => {
    const maxLevel = parseInt(query.maxLevel) || 3;

    const paths = await NetworkPath.findAll({
      where: { ancestorId: userId, level: { [Op.gt]: 0, [Op.lte]: maxLevel } },
    });
    const descendantIds = paths.map((p) => p.descendantId);
    if (descendantIds.length === 0) return [];

    const where = { id: { [Op.in]: descendantIds } };
    if (query.status) where.status = query.status;
    if (query.city) where.city = query.city;

    if (query.joinedFrom || query.joinedTo) {
      where.createdAt = {};
      if (query.joinedFrom) where.createdAt[Op.gte] = new Date(query.joinedFrom);
      if (query.joinedTo) where.createdAt[Op.lte] = new Date(query.joinedTo);
    }

    let users = await User.findAll({ where });

    // qualifiedThisMonth: did this user place a qualifying order this calendar month?
    // NOTE: this is an expensive per-request join because there's no MemberQualification
    // table yet (schema-gaps.md item #2) — flagged there as the fix for this exact case.
    if (query.qualifiedThisMonth !== undefined) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const qualifyingOrders = await Order.findAll({
        where: {
          buyerUserId: { [Op.in]: users.map((u) => u.id) },
          status: "PAID",
          createdAt: { [Op.gte]: monthStart },
        },
        include: [
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Package, as: "package", where: { isQualifying: true } }],
          },
        ],
      });

      const qualifiedUserIds = new Set(qualifyingOrders.map((o) => o.buyerUserId));
      const wantsQualified = query.qualifiedThisMonth === "true";

      users = users.filter((u) =>
        wantsQualified ? qualifiedUserIds.has(u.id) : !qualifiedUserIds.has(u.id)
      );
    }

    const levelById = Object.fromEntries(paths.map((p) => [p.descendantId, p.level]));
    let result = users.map((u) => ({ ...u.toJSON(), level: levelById[u.id] }));

    const sortField = ["level", "joinedAt", "directReferralCount"].includes(query.sort)
      ? query.sort
      : "level";

    result.sort((a, b) => {
      if (sortField === "level") return a.level - b.level;
      if (sortField === "joinedAt") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortField === "directReferralCount")
        return b.directReferralCount - a.directReferralCount;
      return 0;
    });

    return result;
  },
};

module.exports = networkFilterRepository;