const paymentMethodExtendedRepository = require("../repositories/paymentMethodExtendedRepository");

const paymentMethodExtendedService = {
  getPayments: (id) => paymentMethodExtendedRepository.getPayments(id),
  getActive: () => paymentMethodExtendedRepository.getActive(),
  getAvailableForAmount: (amount) =>
    paymentMethodExtendedRepository.getAvailableForAmount(amount),
  activate: (id) => paymentMethodExtendedRepository.setActive(id, true),
  deactivate: (id) => paymentMethodExtendedRepository.setActive(id, false),
};

module.exports = paymentMethodExtendedService;
