const { NetworkPath, User } = require("../models");
const { Op } = require("sequelize");

const networkRelationshipRepository = {
  // Rows where descendantId = userId, ordered by level — the upline
  getAncestors: async (userId) => {
    const paths = await NetworkPath.findAll({
      where: {
        descendantId: userId,
        level: { [Op.gt]: 0 },
      },
      order: [["level", "ASC"]],
    });

    const ancestorIds = paths.map((p) => p.ancestorId);
    if (ancestorIds.length === 0) return [];

    const users = await User.findAll({
      where: { id: { [Op.in]: ancestorIds } },
      attributes: ["id", "fullName", "email", "status"],
    });

    const levelById = Object.fromEntries(paths.map((p) => [p.ancestorId, p.level]));
    return users
      .map((u) => ({ ...u.toJSON(), level: levelById[u.id] }))
      .sort((a, b) => a.level - b.level);
  },

  // Flat descendant list, each with its level
  getDescendants: async (userId, maxLevel = 3) => {
    const paths = await NetworkPath.findAll({
      where: {
        ancestorId: userId,
        level: { [Op.gt]: 0, [Op.lte]: maxLevel },
      },
      order: [["level", "ASC"]],
    });

    const descendantIds = paths.map((p) => p.descendantId);
    if (descendantIds.length === 0) return [];

    const users = await User.findAll({
      where: { id: { [Op.in]: descendantIds } },
      attributes: ["id", "fullName", "email", "status", "createdAt", "city", "directReferralCount"],
    });

    const levelById = Object.fromEntries(paths.map((p) => [p.descendantId, p.level]));
    return users.map((u) => ({ ...u.toJSON(), level: levelById[u.id] }));
  },

  // Everyone at exactly level N below this user
  getAtLevel: async (userId, level) => {
    const paths = await NetworkPath.findAll({
      where: { ancestorId: userId, level },
    });

    const descendantIds = paths.map((p) => p.descendantId);
    if (descendantIds.length === 0) return [];

    return await User.findAll({
      where: { id: { [Op.in]: descendantIds } },
      attributes: ["id", "fullName", "email", "status"],
    });
  },

  // Are these two related, and at what distance
  getRelationship: async (userId, otherId) => {
    // Check userId as ancestor of otherId
    const asAncestor = await NetworkPath.findOne({
      where: { ancestorId: userId, descendantId: otherId },
    });
    if (asAncestor) {
      return {
        related: true,
        direction: "ancestor", // userId is above otherId
        level: asAncestor.level,
      };
    }

    // Check userId as descendant of otherId
    const asDescendant = await NetworkPath.findOne({
      where: { ancestorId: otherId, descendantId: userId },
    });
    if (asDescendant) {
      return {
        related: true,
        direction: "descendant", // userId is below otherId
        level: asDescendant.level,
      };
    }

    return { related: false, direction: null, level: null };
  },
};

module.exports = networkRelationshipRepository;