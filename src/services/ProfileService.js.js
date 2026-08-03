const profileRepository = require("../repositories/profileRepository");
const qualificationRepository = require("../repositories/qualificationRepository");

const profileService = {
  getMe: (userId) => profileRepository.getMe(userId),
  updateMe: (userId, body) => profileRepository.updateMe(userId, body),
  changePassword: (userId, body) =>
    profileRepository.changePassword(userId, body),
  setAvatar: (userId, url) => profileRepository.setAvatar(userId, url),
  getReferralLink: (userId) => profileRepository.getReferralLink(userId),

  setStatus: (userId, body, adminId) =>
    profileRepository.setStatus(userId, body, adminId),
  activate: (userId, reason, adminId) =>
    profileRepository.activate(userId, reason, adminId),

  submitKyc: (userId, data) => profileRepository.submitKyc(userId, data),
  approveKyc: (docId, adminId) => profileRepository.approveKyc(docId, adminId),
  rejectKyc: (docId, adminId, reason) =>
    profileRepository.rejectKyc(docId, adminId, reason),
  getKycQueue: () => profileRepository.getKycQueue(),

  getQualificationStatus: (userId, period) =>
    qualificationRepository.getStatus(userId, period),
  grantQualification: (data, adminId) =>
    qualificationRepository.grantManual(data, adminId),
  revokeQualification: (data, adminId) =>
    qualificationRepository.revoke(data, adminId),
};

module.exports = profileService;