const { LevelConfiguration } = require("../models");

const levelConfigurationRepository = {
  findAll: async () => {
    return await LevelConfiguration.findAll();
  },

  findById: async (id) => {
    return await LevelConfiguration.findByPk(id);
  },

  create: async (data) => {
    return await LevelConfiguration.create(data);
  },

  update: async (id, data) => {
    const config = await LevelConfiguration.findByPk(id);
    if (!config) return null;
    await config.update(data);
    return await LevelConfiguration.findByPk(id);
  },

  delete: async (id) => {
    const config = await LevelConfiguration.findByPk(id);
    if (!config) return null;
    await config.destroy();
    return config;
  },
};

module.exports = levelConfigurationRepository;