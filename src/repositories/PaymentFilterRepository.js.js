const { Payment, Order, PaymentMethod, User } = require("../models");
const { Op } = require("sequelize");
const { getPagination, buildMeta } = require("../utils/pagination");

// Spec section 5.3 — GET /api/payments filter.
// paymentExtendedService already requires this file; it did not exist,
// so the app crashed on boot with MODULE_NOT_FOUND.
const paymentFilterRepository = {
  findFiltered: async (q) => {
    const { page, limit, offset } = getPagination(q);
    const where = {};

    if (q.status) where.status = q.status;
    if (q.paymentMethodId) where.paymentMethodId = q.paymentMethodId;
    if (q.userId) where.userId = q.userId;
    if (q.orderId) where.orderId = q.orderId;
    if (q.reviewedById) where.reviewedById = q.reviewedById;
    if (q.referenceNo) where.referenceNo = { [Op.like]: `%${q.referenceNo}%` };

    if (q.hasProof !== undefined) {
      const has = q.hasProof === "true" || q.hasProof === true;
      where.proofImageUrl = has ? { [Op.ne]: null } : { [Op.is]: null };
    }

    if (q.minAmount || q.maxAmount) {
      where.amount = {};
      if (q.minAmount) where.amount[Op.gte] = q.minAmount;
      if (q.maxAmount) where.amount[Op.lte] = q.maxAmount;
    }

    if (q.dateFrom || q.dateTo) {
      where.createdAt = {};
      if (q.dateFrom) where.createdAt[Op.gte] = new Date(q.dateFrom);
      if (q.dateTo) where.createdAt[Op.lte] = new Date(q.dateTo);
    }

    if (q.reviewedFrom || q.reviewedTo) {
      where.reviewedAt = {};
      if (q.reviewedFrom) where.reviewedAt[Op.gte] = new Date(q.reviewedFrom);
      if (q.reviewedTo) where.reviewedAt[Op.lte] = new Date(q.reviewedTo);
    }

    const SORTABLE = ["createdAt", "amount", "reviewedAt"];
    const sort = SORTABLE.includes(q.sort) ? q.sort : "createdAt";
    const order = String(q.order).toLowerCase() === "asc" ? "ASC" : "DESC";

    const { rows, count } = await Payment.findAndCountAll({
      where,
      include: [
        { model: Order, attributes: ["id", "orderNumber", "totalAmount", "status"] },
        { model: PaymentMethod, attributes: ["id", "name", "code", "methodType"] },
        { model: User, as: "payer", attributes: ["id", "fullName", "phone"] },
        { model: User, as: "reviewer", attributes: ["id", "fullName"] },
      ],
      order: [[sort, order]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    return { data: rows, meta: buildMeta({ count, page, limit }) };
  },
};

module.exports = paymentFilterRepository;