const { NetworkPath, User, Order } = require("../models");
const { Op } = require("sequelize");

const networkBusinessRepository = {
  /**
   * Nested tree object, capped at `depth` levels.
   * Built from a single NetworkPath query (not recursive per-level queries),
   * then assembled in memory using sponsorId to nest correctly.
   */
  getTree: async (userId, depth = 3) => {
    const rootUser = await User.findByPk(userId, {
      attributes: ["id", "fullName", "email", "status", "depth", "sponsorId"],
    });
    if (!rootUser) throw new Error("User not found");

    const paths = await NetworkPath.findAll({
      where: {
        ancestorId: userId,
        level: { [Op.gt]: 0, [Op.lte]: depth },
      },
    });

    const descendantIds = paths.map((p) => p.descendantId);
    const allUsers =
      descendantIds.length > 0
        ? await User.findAll({
            where: { id: { [Op.in]: descendantIds } },
            attributes: ["id", "fullName", "email", "status", "sponsorId", "depth"],
          })
        : [];

    const usersById = Object.fromEntries(allUsers.map((u) => [u.id, u.toJSON()]));

    const buildNode = (user) => {
      const children = allUsers
        .filter((u) => u.sponsorId === user.id)
        .map((u) => buildNode(usersById[u.id]));
      return { ...user, referrals: children };
    };

    return buildNode(rootUser.toJSON());
  },

  /**
   * Count per level, active vs inactive, total downline, new joins this period.
   * Single-pass queries against NetworkPath + User, no tree walking.
   */
  getStats: async (userId, periodDays = 30) => {
    const paths = await NetworkPath.findAll({
      where: { ancestorId: userId, level: { [Op.gt]: 0 } },
    });

    const descendantIds = paths.map((p) => p.descendantId);
    const levelById = Object.fromEntries(paths.map((p) => [p.descendantId, p.level]));

    if (descendantIds.length === 0) {
      return {
        totalDownline: 0,
        countByLevel: {},
        activeCount: 0,
        inactiveCount: 0,
        newJoinsThisPeriod: 0,
      };
    }

    const users = await User.findAll({
      where: { id: { [Op.in]: descendantIds } },
      attributes: ["id", "status", "createdAt"],
    });

    const countByLevel = {};
    let activeCount = 0;
    let inactiveCount = 0;

    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    let newJoinsThisPeriod = 0;

    for (const u of users) {
      const level = levelById[u.id];
      countByLevel[level] = (countByLevel[level] || 0) + 1;

      if (u.status === "ACTIVE") activeCount++;
      else inactiveCount++;

      if (new Date(u.createdAt) >= periodStart) newJoinsThisPeriod++;
    }

    return {
      totalDownline: users.length,
      countByLevel,
      activeCount,
      inactiveCount,
      newJoinsThisPeriod,
    };
  },

  /**
   * Splits the downline using NetworkPath.type (horizontal|vertical).
   * NOTE: per schema-gaps.md item #7, a closure-table row naturally represents
   * a single ancestor-descendant distance, not a clean "leg type" — this
   * assumes `type` is set correctly at NetworkPath creation time. If it isn't
   * being set yet, this will return empty legs until that's fixed upstream.
   */
  getLegs: async (userId, type) => {
    const where = { ancestorId: userId, level: { [Op.gt]: 0 } };
    if (type) where.type = type;

    const paths = await NetworkPath.findAll({ where });
    const descendantIds = paths.map((p) => p.descendantId);

    if (descendantIds.length === 0) return [];

    const users = await User.findAll({
      where: { id: { [Op.in]: descendantIds } },
      attributes: ["id", "fullName", "email", "status"],
    });

    const typeById = Object.fromEntries(paths.map((p) => [p.descendantId, p.type]));
    return users.map((u) => ({ ...u.toJSON(), legType: typeById[u.id] }));
  },
};

module.exports = networkBusinessRepository;