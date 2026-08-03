const { Product } = require("../models");
const { Op } = require("sequelize");

const productFilterRepository = {
  findFiltered: async (query = {}) => {
    const where = {};

    if (query.search) {
      const search = `%${String(query.search).trim()}%`;
      where[Op.or] = [
        { sku: { [Op.like]: search } },
        { name: { [Op.like]: search } },
        { category: { [Op.like]: search } },
      ];
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true" || query.isActive === true;
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      order: [["createdAt", "DESC"], ["id", "DESC"]],
      limit: query.limit ? Number(query.limit) : 50,
      offset: query.offset ? Number(query.offset) : 0,
    });

    return { products: rows, total: count };
  },
};

module.exports = productFilterRepository;
