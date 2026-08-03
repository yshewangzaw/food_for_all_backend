const { User } = require("../models");
const { Op, literal } = require("sequelize");

/**
 * Builds a Sequelize where-clause + options from the query params defined
 * in spec section 1.3 for GET /users.
 */
const buildUserFilterQuery = (query) => {
  const where = {};

  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;
  if (query.kycStatus) where.kycStatus = query.kycStatus;
  if (query.city) where.city = query.city;
  if (query.sponsorId) where.sponsorId = query.sponsorId;

  if (query.depth !== undefined) {
    where.depth = query.depth;
  } else if (query.minDepth || query.maxDepth) {
    where.depth = {};
    if (query.minDepth) where.depth[Op.gte] = query.minDepth;
    if (query.maxDepth) where.depth[Op.lte] = query.maxDepth;
  }

  if (query.minDirectReferrals) {
    where.directReferralCount = { [Op.gte]: query.minDirectReferrals };
  }

  if (query.activated === "true") where.activatedAt = { [Op.ne]: null };
  if (query.activated === "false") where.activatedAt = null;

  if (query.phoneVerified === "true") where.phoneVerifiedAt = { [Op.ne]: null };
  if (query.phoneVerified === "false") where.phoneVerifiedAt = null;

  if (query.hasWalletBalance === "true") where.wallet = { [Op.gt]: 0 };
  if (query.hasWalletBalance === "false") where.wallet = { [Op.lte]: 0 };

  if (query.createdFrom || query.createdTo) {
    where.createdAt = {};
    if (query.createdFrom) where.createdAt[Op.gte] = new Date(query.createdFrom);
    if (query.createdTo) where.createdAt[Op.lte] = new Date(query.createdTo);
  }

  if (query.search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${query.search}%` } },
      { email: { [Op.like]: `%${query.search}%` } },
      { phone: { [Op.like]: `%${query.search}%` } },
      { referralCode: { [Op.like]: `%${query.search}%` } },
    ];
  }

  const allowedSortFields = ["createdAt", "fullName", "directReferralCount", "depth"];
  const sort = allowedSortFields.includes(query.sort) ? query.sort : "createdAt";
  const order = query.order === "asc" ? "ASC" : "DESC";

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 25;
  const offset = (page - 1) * limit;

  return {
    where,
    order: [[sort, order]],
    limit,
    offset,
    page,
  };
};

const userFilterRepository = {
  findFiltered: async (query) => {
    const { where, order, limit, offset, page } = buildUserFilterQuery(query);

    const { rows, count } = await User.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return {
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  },
};

module.exports = userFilterRepository;