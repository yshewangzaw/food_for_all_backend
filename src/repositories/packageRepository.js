const { Package, PackageItem, Product } = require("../models");

const packageRepository = {
  findAll: async () => {
    return await Package.findAll({
      include: [
        {
          model: PackageItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });
  },

  findById: async (id) => {
    return await Package.findByPk(id, {
      include: [
        {
          model: PackageItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });
  },

  create: async (data) => {
    return await Package.create(data);
  },

  update: async (id, data) => {
    const pkg = await Package.findByPk(id);

    if (!pkg) return null;

    await pkg.update(data);

    return await Package.findByPk(id, {
      include: [
        {
          model: PackageItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });
  },

  delete: async (id) => {
    const pkg = await Package.findByPk(id);

    if (!pkg) return null;

    await pkg.destroy();

    return pkg;
  },
};

module.exports = packageRepository;
