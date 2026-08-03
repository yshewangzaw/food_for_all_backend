const { NetworkPath } = require("../models");
const sequelize = require("../config/database");

/**
 * Creates all NetworkPath rows for a newly registered user.
 *
 * Rules (from the spec):
 * - Every user gets a level:0 self-row (ancestorId = descendantId = their own id).
 *   This makes "the member themself" a valid lookup target, same as any ancestor.
 * - If the user has a sponsor, copy every row where the sponsor is the DESCENDANT
 *   (i.e. every ancestor the sponsor has, including the sponsor's own self-row),
 *   re-pointed to the new user as descendant, with level + 1.
 *
 * This must run inside the same transaction as the User.create() call during
 * registration, so a failure here rolls back the user creation too — we never
 * want a User to exist without a correct NetworkPath.
 *
 * @param {object} newUser - the just-created User instance (must have id and sponsorId)
 * @param {object} [transaction] - optional Sequelize transaction to run inside
 */
const createNetworkPathsForNewUser = async (newUser, transaction) => {
  const t = transaction || (await sequelize.transaction());
  const isExternalTransaction = !!transaction;

  try {
    const rowsToInsert = [];

    // 1. Self-row — every user is their own ancestor at level 0
    rowsToInsert.push({
      ancestorId: newUser.id,
      descendantId: newUser.id,
      level: 0,
    });

    // 2. Copy the sponsor's ancestor chain, if a sponsor exists
    if (newUser.sponsorId) {
      const sponsorPaths = await NetworkPath.findAll({
        where: { descendantId: newUser.sponsorId },
        transaction: t,
      });

      for (const path of sponsorPaths) {
        rowsToInsert.push({
          ancestorId: path.ancestorId,
          descendantId: newUser.id,
          level: path.level + 1,
        });
      }
    }

    await NetworkPath.bulkCreate(rowsToInsert, { transaction: t });

    if (!isExternalTransaction) {
      await t.commit();
    }

    return rowsToInsert;
  } catch (error) {
    if (!isExternalTransaction) {
      await t.rollback();
    }
    throw error;
  }
};

module.exports = { createNetworkPathsForNewUser };