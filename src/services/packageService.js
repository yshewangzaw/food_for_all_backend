const packageRepository = require("../repositories/packageRepository");

const packageService = {
  getAll: async () => {
    return await packageRepository.findAll();
  },

  getById: async (id) => {
    const pkg = await packageRepository.findById(id);
    if (!pkg) throw new Error("Package not found");
    return pkg;
  },

  create: async (data) => {
    return await packageRepository.create(data);
  },

  update: async (id, data) => {
    const pkg = await packageRepository.update(id, data);
    if (!pkg) throw new Error("Package not found");
    return pkg;
  },

  delete: async (id) => {
    const pkg = await packageRepository.delete(id);
    if (!pkg) throw new Error("Package not found");
    return pkg;
  }
};

module.exports = packageService;