const { Product, OrderItem, Order } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const productBusinessRepository = {
  setActive: async (productId, isActive) => {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error("Product not found");
    await product.update({ isActive });
    return product;
  },

  setImage: async (productId, imageUrl) => {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error("Product not found");
    await product.update({ imageUrl });
    return product;
  },

  getCategories: async () => {
    const rows = await Product.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("category")), "category"]],
      where: { category: { [Op.ne]: null } },
      raw: true,
    });
    return rows.map((r) => r.category).filter(Boolean);
  },

  getSalesStats: async (productId, from, to) => {
    const where = { productId };
    const orderWhere = { status: "PAID" };

    if (from || to) {
      orderWhere.createdAt = {};
      if (from) orderWhere.createdAt[Op.gte] = new Date(from);
      if (to) orderWhere.createdAt[Op.lte] = new Date(to);
    }

    const items = await OrderItem.findAll({
      where,
      include: [{ model: Order, as: "order", where: orderWhere, attributes: [] }],
    });

    const unitsSold = items.reduce((sum, i) => sum + i.quantity, 0);
    const revenue = items.reduce((sum, i) => sum + parseFloat(i.unitPrice) * i.quantity, 0);
    const pvGenerated = items.reduce((sum, i) => sum + parseFloat(i.pvTotal || 0), 0);

    return { unitsSold, revenue, pvGenerated, orderLineCount: items.length };
  },

  /**
   * Bulk import from parsed rows (already extracted from CSV/XLSX by the controller).
   * dryRun=true validates without writing to the DB.
   */
  bulkImport: async (rows, dryRun = false) => {
    const results = { valid: [], invalid: [], created: 0 };

    for (const [index, row] of rows.entries()) {
      const errors = [];
      if (!row.sku) errors.push("Missing sku");
      if (!row.name) errors.push("Missing name");
      if (row.unitPrice === undefined || isNaN(parseFloat(row.unitPrice)))
        errors.push("Invalid unitPrice");
      if (row.pvValue === undefined || isNaN(parseFloat(row.pvValue)))
        errors.push("Invalid pvValue");
      if (!["kg", "litre", "pcs"].includes(row.unitOfMeasure))
        errors.push("unitOfMeasure must be kg, litre, or pcs");

      if (row.sku) {
        const existing = await Product.findOne({ where: { sku: row.sku } });
        if (existing) errors.push(`SKU '${row.sku}' already exists`);
      }

      if (errors.length > 0) {
        results.invalid.push({ row: index + 1, sku: row.sku, errors });
      } else {
        results.valid.push(row);
      }
    }

    if (!dryRun && results.valid.length > 0) {
      const created = await Product.bulkCreate(
        results.valid.map((r) => ({
          sku: r.sku,
          name: r.name,
          description: r.description || null,
          category: r.category || null,
          unitPrice: parseFloat(r.unitPrice),
          pvValue: parseFloat(r.pvValue),
          unitOfMeasure: r.unitOfMeasure,
          imageUrl: r.imageUrl || null,
          isActive: r.isActive !== undefined ? r.isActive === "true" || r.isActive === true : true,
        }))
      );
      results.created = created.length;
    }

    return results;
  },
};

module.exports = productBusinessRepository;