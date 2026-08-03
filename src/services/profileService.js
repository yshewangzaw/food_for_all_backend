const profileService = {
  getMe: async (userId) => ({ id: userId }),
  updateMe: async (userId, payload) => ({ id: userId, ...payload }),
  changePassword: async (userId, payload) => ({ id: userId, ...payload }),
  setAvatar: async (userId, avatarUrl) => ({ id: userId, avatarUrl }),
  getReferralLink: async (userId) => ({ userId, referralLink: `/register/${userId}` }),
  getQualificationStatus: async (userId) => ({ userId, status: "PENDING" }),
  setStatus: async (userId, payload) => ({ userId, ...payload }),
  activate: async (userId) => ({ userId, active: true }),
  grantQualification: async (payload) => payload,
  revokeQualification: async (payload) => payload,
  submitKyc: async (userId, data) => ({ userId, ...data }),
  approveKyc: async (kycId) => ({ id: kycId, status: "APPROVED" }),
  rejectKyc: async (kycId) => ({ id: kycId, status: "REJECTED" }),
  getKycQueue: async () => [],
};

module.exports = profileService;
