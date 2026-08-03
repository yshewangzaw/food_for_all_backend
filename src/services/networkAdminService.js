const networkAdminRepository = require("../repositories/networkAdminRepository");

const networkAdminService = {
  rebuildAll: async () => {
    return await networkAdminRepository.rebuildAll();
  },

  rebuildSubtree: async (userId) => {
    return await networkAdminRepository.rebuildSubtree(userId);
  },

  integrityCheck: async () => {
    return await networkAdminRepository.integrityCheck();
  },
};

module.exports = networkAdminService;