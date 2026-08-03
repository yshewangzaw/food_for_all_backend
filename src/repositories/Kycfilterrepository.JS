const { KycDocument } = require("../models");
const { Op } = require("sequelize");

const kycFilterRepository = {
  findFiltered: async (query) => {
    const where = {};

    if (query.status) where.status = query.status;
    if (query.documentType) where.documentType = query.documentType;
    if (query.userId) where.userId = query.userId;

    if (query.submittedFrom || query.submittedTo) {
      where.createdAt = {};
      if (query.submittedFrom) where.createdAt[Op.gte] = new Date(query.submittedFrom);
      if (query.submittedTo) where.createdAt[Op.lte] = new Date(query.submittedTo);
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 25;
    const offset = (page - 1) * limit;

    const { rows, count } = await KycDocument.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
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

module.exports = kycFilterRepository;