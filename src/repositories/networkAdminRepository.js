const { NetworkPath, User } = require("../models");
const sequelize = require("../config/database");
const { Op } = require("sequelize");

/**
 * Builds the full set of NetworkPath rows for one user, given the already-known
 * paths of their sponsor. Pure function — no DB access — so it can be reused
 * by both the full rebuild and the single-subtree rebuild.
 */
const buildRowsForUser = (user, sponsorPathsByDescendant) => {
  const rows = [{ ancestorId: user.id, descendantId: user.id, level: 0 }];

  if (user.sponsorId) {
    const sponsorRows = sponsorPathsByDescendant[user.sponsorId] || [];
    for (const row of sponsorRows) {
      rows.push({
        ancestorId: row.ancestorId,
        descendantId: user.id,
        level: row.level + 1,
      });
    }
  }

  return rows;
};

const networkAdminRepository = {
  /**
   * Recomputes the ENTIRE closure table from sponsorId, from scratch.
   * Processes users in depth order so each user's sponsor is already resolved
   * before the user itself is processed — this avoids needing recursion.
   */
  rebuildAll: async () => {
    const t = await sequelize.transaction();

    try {
      const allUsers = await User.findAll({
        attributes: ["id", "sponsorId", "depth"],
        order: [["depth", "ASC"], ["id", "ASC"]],
        transaction: t,
      });

      await NetworkPath.destroy({ where: {}, truncate: true, transaction: t });

      // Map of userId -> the rows where that user is the descendant,
      // built incrementally as we go so children can reference their parent's rows
      const pathsByDescendant = {};
      const allRowsToInsert = [];

      for (const user of allUsers) {
        const rows = buildRowsForUser(user, pathsByDescendant);
        pathsByDescendant[user.id] = rows;
        allRowsToInsert.push(...rows);
      }

      await NetworkPath.bulkCreate(allRowsToInsert, { transaction: t });
      await t.commit();

      return { usersProcessed: allUsers.length, rowsCreated: allRowsToInsert.length };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  /**
   * Rebuilds only the subtree rooted at userId — that user plus every
   * descendant found via sponsorId (not via NetworkPath, since that may be
   * the very thing that's corrupt).
   */
  rebuildSubtree: async (userId) => {
    const t = await sequelize.transaction();

    try {
      const rootUser = await User.findByPk(userId, { transaction: t });
      if (!rootUser) throw new Error("User not found");

      // Walk sponsorId links to find every descendant, breadth-first
      const subtreeUsers = [rootUser];
      let frontier = [rootUser.id];

      while (frontier.length > 0) {
        const children = await User.findAll({
          where: { sponsorId: { [Op.in]: frontier } },
          transaction: t,
        });
        if (children.length === 0) break;
        subtreeUsers.push(...children);
        frontier = children.map((c) => c.id);
      }

      const subtreeIds = subtreeUsers.map((u) => u.id);

      // Delete existing rows where any subtree member is the descendant
      await NetworkPath.destroy({
        where: { descendantId: { [Op.in]: subtreeIds } },
        transaction: t,
      });

      // Sort by depth so sponsors are resolved before their children
      subtreeUsers.sort((a, b) => a.depth - b.depth);

      const pathsByDescendant = {};

      // Preload the root's sponsor's existing (clean) rows, if any
      if (rootUser.sponsorId) {
        const sponsorRows = await NetworkPath.findAll({
          where: { descendantId: rootUser.sponsorId },
          transaction: t,
        });
        pathsByDescendant[rootUser.sponsorId] = sponsorRows.map((r) => ({
          ancestorId: r.ancestorId,
          level: r.level,
        }));
      }

      const allRowsToInsert = [];
      for (const user of subtreeUsers) {
        const rows = buildRowsForUser(user, pathsByDescendant);
        pathsByDescendant[user.id] = rows;
        allRowsToInsert.push(...rows);
      }

      await NetworkPath.bulkCreate(allRowsToInsert, { transaction: t });
      await t.commit();

      return { usersProcessed: subtreeUsers.length, rowsCreated: allRowsToInsert.length };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  /**
   * Detects cycles, orphans, missing level-0 rows, and depth mismatches.
   * Read-only — reports problems, does not fix them (use rebuild for that).
   */
  integrityCheck: async () => {
    const issues = {
      cycles: [],
      orphanRows: [],
      missingSelfRows: [],
      depthMismatches: [],
      duplicatePairs: [],
    };

    const allUsers = await User.findAll({ attributes: ["id", "sponsorId", "depth"] });
    const userIds = new Set(allUsers.map((u) => u.id));

    // --- Cycle detection via sponsorId chain ---
    for (const user of allUsers) {
      const visited = new Set();
      let current = user;
      while (current && current.sponsorId) {
        if (visited.has(current.sponsorId) || current.sponsorId === user.id) {
          issues.cycles.push({ userId: user.id, detectedAt: current.sponsorId });
          break;
        }
        visited.add(current.sponsorId);
        current = allUsers.find((u) => u.id === current.sponsorId);
      }
    }

    // --- Orphan rows: ancestorId or descendantId not in users table ---
    const allPaths = await NetworkPath.findAll();
    for (const path of allPaths) {
      if (!userIds.has(path.ancestorId) || !userIds.has(path.descendantId)) {
        issues.orphanRows.push({
          id: path.id,
          ancestorId: path.ancestorId,
          descendantId: path.descendantId,
        });
      }
    }

    // --- Missing level-0 self rows ---
    const selfRowUserIds = new Set(
      allPaths
        .filter((p) => p.ancestorId === p.descendantId && p.level === 0)
        .map((p) => p.ancestorId)
    );
    for (const user of allUsers) {
      if (!selfRowUserIds.has(user.id)) {
        issues.missingSelfRows.push({ userId: user.id });
      }
    }

    // --- Depth mismatches: user.depth should equal count of ancestors (level > 0) ---
    const ancestorCountByUser = {};
    for (const path of allPaths) {
      if (path.level > 0) {
        ancestorCountByUser[path.descendantId] =
          (ancestorCountByUser[path.descendantId] || 0) + 1;
      }
    }
    for (const user of allUsers) {
      const actualAncestorCount = ancestorCountByUser[user.id] || 0;
      if (actualAncestorCount !== user.depth) {
        issues.depthMismatches.push({
          userId: user.id,
          storedDepth: user.depth,
          actualAncestorCount,
        });
      }
    }

    // --- Duplicate (ancestorId, descendantId) pairs ---
    const seenPairs = {};
    for (const path of allPaths) {
      const key = `${path.ancestorId}-${path.descendantId}`;
      seenPairs[key] = (seenPairs[key] || 0) + 1;
    }
    for (const [key, count] of Object.entries(seenPairs)) {
      if (count > 1) {
        const [ancestorId, descendantId] = key.split("-").map(Number);
        issues.duplicatePairs.push({ ancestorId, descendantId, count });
      }
    }

    const totalIssues =
      issues.cycles.length +
      issues.orphanRows.length +
      issues.missingSelfRows.length +
      issues.depthMismatches.length +
      issues.duplicatePairs.length;

    return { clean: totalIssues === 0, totalIssues, issues };
  },
};

module.exports = networkAdminRepository;