const {
  Package,
  PackageItem,
  Product,
  Order,
  OrderItem,
  Commission,
} = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const packageExtendedRepository = {
  // --- Relationship ---

  getItems: async (packageId) => {
    return await PackageItem.findAll({
      where: { packageId },
      include: [{ model: Product, as: "product" }],
    });
  },

  getOrders: async (packageId) => {
    const items = await OrderItem.findAll({
      where: { packageId },
      include: [{ model: Order, as: "order" }],
    });
    const seen = new Map();
    for (const item of items) {
      if (item.order) seen.set(item.order.id, item.order);
    }
    return Array.from(seen.values());
  },

  // --- Business logic ---

  getEntryPackage: async () => {
    const pkg = await Package.findOne({
      where: {
        isEntryPackage: 1,
      },
    });

    console.log("PACKAGE RESULT:", pkg ? pkg.toJSON() : null);

    if (!pkg) {
      throw new Error("Package not found");
    }

    return pkg;
  },
  getQualifyingPackages: async () => {
    return await Package.findAll({
      where: { isQualifying: true, isActive: true },
    });
  },

  getActiveOn: async (onDate) => {
    const date = onDate ? new Date(onDate) : new Date();
    return await Package.findAll({
      where: {
        isActive: true,
        effectiveFrom: { [Op.lte]: date },
        [Op.or]: [{ effectiveTo: null }, { effectiveTo: { [Op.gte]: date } }],
      },
    });
  },

  supersede: async (packageId, replacementData) => {
    const t = await sequelize.transaction();
    try {
      const current = await Package.findByPk(packageId, { transaction: t });
      if (!current) throw new Error("Package not found");

      const now = new Date();
      await current.update(
        { effectiveTo: now, isActive: false },
        { transaction: t },
      );

      const replacement = await Package.create(
        {
          ...replacementData,
          effectiveFrom: now,
          effectiveTo: null,
          isActive: true,
        },
        { transaction: t },
      );

      await t.commit();
      return { closed: current, replacement };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  setActive: async (packageId, isActive) => {
    const pkg = await Package.findByPk(packageId);
    if (!pkg) throw new Error("Package not found");
    await pkg.update({ isActive });
    return pkg;
  },

  setImage: async (packageId, imageUrl) => {
    const pkg = await Package.findByPk(packageId);
    if (!pkg) throw new Error("Package not found");
    await pkg.update({ imageUrl });
    return pkg;
  },

  getComputedValue: async (packageId) => {
    const pkg = await Package.findByPk(packageId);
    if (!pkg) throw new Error("Package not found");

    const items = await PackageItem.findAll({
      where: { packageId },
      include: [{ model: Product, as: "product" }],
    });

    let computedPrice = 0;
    let computedPv = 0;
    for (const item of items) {
      if (item.product) {
        computedPrice += parseFloat(item.product.unitPrice) * item.quantity;
        computedPv += parseFloat(item.product.pvValue) * item.quantity;
      }
    }

    return {
      packagePrice: parseFloat(pkg.price),
      computedPrice,
      priceMismatch: Math.abs(parseFloat(pkg.price) - computedPrice) > 0.01,
      packagePv: parseFloat(pkg.pvValue),
      computedPv,
      pvMismatch: Math.abs(parseFloat(pkg.pvValue) - computedPv) > 0.01,
    };
  },

  getSalesStats: async (packageId, from, to) => {
    const orderWhere = { status: "PAID" };
    if (from || to) {
      orderWhere.createdAt = {};
      if (from) orderWhere.createdAt[Op.gte] = new Date(from);
      if (to) orderWhere.createdAt[Op.lte] = new Date(to);
    }

    const items = await OrderItem.findAll({
      where: { packageId },
      include: [
        { model: Order, as: "order", where: orderWhere, attributes: ["id"] },
      ],
    });

    const orderIds = items.map((i) => i.order.id);
    const unitsSold = items.reduce((sum, i) => sum + i.quantity, 0);
    const revenue = items.reduce(
      (sum, i) => sum + parseFloat(i.unitPrice) * i.quantity,
      0,
    );
    const pvGenerated = items.reduce(
      (sum, i) => sum + parseFloat(i.pvTotal || 0),
      0,
    );

    // NOTE: assumes Commission.orderId exists, per schema-gaps.md item #1.
    // Until that column is added, this will throw — flagging rather than
    // silently returning a wrong number.
    let commissionPaidOut = 0;
    if (orderIds.length > 0) {
      commissionPaidOut =
        (await Commission.sum("commissionAmount", {
          where: { status: "CREDITED", orderId: { [Op.in]: orderIds } },
        })) || 0;
    }

    return { unitsSold, revenue, pvGenerated, commissionPaidOut };
  },
};

module.exports = packageExtendedRepository;
