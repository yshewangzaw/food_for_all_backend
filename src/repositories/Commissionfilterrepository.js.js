const { Commission } = require("../models");
const { Op } = require("sequelize");

const commissionFilterRepository = {
  findFiltered: async (query) => {
    const where = {};

    if (query.beneficiaryUserId)
      where.beneficiaryUserId = query.beneficiaryUserId;
    if (query.sourceUserId) where.sourceUserId = query.sourceUserId;
    if (query.commissionRuleId) where.commissionRuleId = query.commissionRuleId;
    if (query.status) where.status = query.status;
    if (query.commissionType) where.commissionType = query.commissionType;
    if (query.levelId) where.levelId = query.levelId;

    if (query.period) {
      const [year, month] = query.period.split("-").map(Number);
      where.createdAt = {
        [Op.gte]: new Date(year, month - 1, 1),
        [Op.lt]: new Date(year, month, 1),
      };
    } else if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt[Op.gte] = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt[Op.lte] = new Date(query.dateTo);
    }

    if (query.creditedFrom || query.creditedTo) {
      where.creditedAt = {};
      if (query.creditedFrom)
        where.creditedAt[Op.gte] = new Date(query.creditedFrom);
      if (query.creditedTo)
        where.creditedAt[Op.lte] = new Date(query.creditedTo);
    }

    if (query.minAmount || query.maxAmount) {
      where.commissionAmount = {};
      if (query.minAmount) where.commissionAmount[Op.gte] = query.minAmount;
      if (query.maxAmount) where.commissionAmount[Op.lte] = query.maxAmount;
    }

    const allowedSort = ["commissionAmount", "createdAt", "creditedAt"];
    const sortField = allowedSort.includes(query.sort)
      ? query.sort
      : "createdAt";

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 25;
    const offset = (page - 1) * limit;

    const { rows, count } = await Commission.findAndCountAll({
      where,
      order: [[sortField, "DESC"]],
      limit,
      offset,
    });

    return {
      data: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  },
};

module.exports = commissionFilterRepository;
