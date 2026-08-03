const levelConfigurationRepository = require("../repositories/levelConfigurationRepository");

const levelConfigurationService = {
  getAll: async () => {
    return await levelConfigurationRepository.findAll();
  },

  getById: async (id) => {
    const config = await levelConfigurationRepository.findById(id);
    if (!config) throw new Error("Level configuration not found");
    return config;
  },

  create: async (data) => {
    return await levelConfigurationRepository.create(data);
  },

  update: async (id, data) => {
    const config = await levelConfigurationRepository.update(id, data);
    if (!config) throw new Error("Level configuration not found");
    return config;
  },

  delete: async (id) => {
    const config = await levelConfigurationRepository.delete(id);
    if (!config) throw new Error("Level configuration not found");
    return config;
  },
};

module.exports = levelConfigurationService;