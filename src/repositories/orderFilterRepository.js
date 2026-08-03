const { Order, OrderItem } = require("../models");
const { Op } = require("sequelize");

const orderFilterRepository = {
  findFiltered: async (query) => {
    const where = {};

    if (query.orderType) where.orderType = query.orderType;
    if (query.status) where.status = query.status;
    if (query.commissionStatus) where.commissionStatus = query.commissionStatus;
    if (query.buyerUserId) where.buyerUserId = query.buyerUserId;

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

    if (query.minTotal || query.maxTotal) {
      where.totalAmount = {};
      if (query.minTotal) where.totalAmount[Op.gte] = query.minTotal;
      if (query.maxTotal) where.totalAmount[Op.lte] = query.maxTotal;
    }

    if (query.minPv || query.maxPv) {
      where.totalPv = {};
      if (query.minPv) where.totalPv[Op.gte] = query.minPv;
      if (query.maxPv) where.totalPv[Op.lte] = query.maxPv;
    }

    if (query.search) {
      where.orderNumber = { [Op.like]: `%${query.search}%` };
    }

    const include = [];
    if (query.packageId || query.productId) {
      const itemWhere = {};
      if (query.packageId) itemWhere.packageId = query.packageId;
      if (query.productId) itemWhere.productId = query.productId;
      include.push({
        model: OrderItem,
        as: "items",
        where: itemWhere,
        required: true,
      });
    }

    const allowedSort = ["createdAt", "totalAmount", "totalPv"];
    const sortField = allowedSort.includes(query.sort)
      ? query.sort
      : "createdAt";

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 25;
    const offset = (page - 1) * limit;

    const { rows, count } = await Order.findAndCountAll({
      where,
      include,
      order: [[sortField, "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  },
};

module.exports = orderFilterRepository;
