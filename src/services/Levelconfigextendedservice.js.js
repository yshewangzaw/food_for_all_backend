const levelConfigExtendedRepository = require("../repositories/levelConfigExtendedRepository");

const levelConfigExtendedService = {
  getRules: async (id) => levelConfigExtendedRepository.getRules(id),
  getActive: async () => levelConfigExtendedRepository.getActive(),
  activate: async (id) => levelConfigExtendedRepository.activate(id),
  deactivate: async (id) => levelConfigExtendedRepository.deactivate(id),
  clone: async (id) => levelConfigExtendedRepository.clone(id),
  findFiltered: async (query) =>
    levelConfigExtendedRepository.findFiltered(query),
};

module.exports = levelConfigExtendedService;
