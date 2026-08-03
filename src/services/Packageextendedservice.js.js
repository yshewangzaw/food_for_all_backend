const packageExtendedRepository = require("../repositories/packageExtendedRepository");

const packageExtendedService = {
  getItems: async (packageId) => packageExtendedRepository.getItems(packageId),
  getOrders: async (packageId) => packageExtendedRepository.getOrders(packageId),
  getEntryPackage: async () => packageExtendedRepository.getEntryPackage(),
  getQualifyingPackages: async () => packageExtendedRepository.getQualifyingPackages(),
  getActiveOn: async (onDate) => packageExtendedRepository.getActiveOn(onDate),
  supersede: async (packageId, data) => packageExtendedRepository.supersede(packageId, data),
  activate: async (packageId) => packageExtendedRepository.setActive(packageId, true),
  deactivate: async (packageId) => packageExtendedRepository.setActive(packageId, false),
  setImage: async (packageId, imageUrl) => packageExtendedRepository.setImage(packageId, imageUrl),
  getComputedValue: async (packageId) => packageExtendedRepository.getComputedValue(packageId),
  getSalesStats: async (packageId, from, to) =>
    packageExtendedRepository.getSalesStats(packageId, from, to),
};

module.exports = packageExtendedService;