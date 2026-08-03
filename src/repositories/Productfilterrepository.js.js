const { Product } = require("../models");
const { Op } = require("sequelize");

const productFilterRepository = {
  findFiltered: async (query) => {
    const where = {};

    if (query.category) where.category = query.category;
    if (query.isActive === "true") where.isActive = true;
    if (query.isActive === "false") where.isActive = false;
    if (query.unitOfMeasure) where.unitOfMeasure = query.unitOfMeasure;

    if (query.minPrice || query.maxPrice) {
      where.unitPrice = {};
      if (query.minPrice) where.unitPrice[Op.gte] = query.minPrice;
      if (query.maxPrice) where.unitPrice[Op.lte] = query.maxPrice;
    }

    if (query.minPv || query.maxPv) {
      where.pvValue = {};
      if (query.minPv) where.pvValue[Op.gte] = query.minPv;
      if (query.maxPv) where.pvValue[Op.lte] = query.maxPv;
    }

    if (query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${query.search}%` } },
        { sku: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
    }

    const allowedSort = ["price", "pvValue", "name", "createdAt"];
    const sortField = allowedSort.includes(query.sort)
      ? query.sort === "price"
        ? "unitPrice"
        : query.sort
      : "createdAt";

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 25;
    const offset = (page - 1) * limit;

    const { rows, count } = await Product.findAndCountAll({
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

module.exports = productFilterRepository;