const packageItemExtendedRepository = require("../repositories/packageItemExtendedRepository");

const packageItemExtendedService = {
  addItem: async (packageId, data) => packageItemExtendedRepository.addItem(packageId, data),
  updateItemQuantity: async (packageId, itemId, quantity) =>
    packageItemExtendedRepository.updateItemQuantity(packageId, itemId, quantity),
  removeItem: async (packageId, itemId) =>
    packageItemExtendedRepository.removeItem(packageId, itemId),
  replaceAllItems: async (packageId, items) =>
    packageItemExtendedRepository.replaceAllItems(packageId, items),
  getProductForItem: async (itemId) => packageItemExtendedRepository.getProductForItem(itemId),
  getPackageForItem: async (itemId) => packageItemExtendedRepository.getPackageForItem(itemId),
};

module.exports = packageItemExtendedService;