const profileService = require("../services/profileService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const profileController = {
  getMe: async (req, res) => {
    try {
      ok(res, await profileService.getMe(req.user.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  updateMe: async (req, res) => {
    try {
      ok(res, await profileService.updateMe(req.user.id, req.body));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  changePassword: async (req, res) => {
    try {
      ok(res, await profileService.changePassword(req.user.id, req.body));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  setAvatar: async (req, res) => {
    try {
      const url = req.file ? `/uploads/${req.file.filename}` : req.body.avatarUrl;
      if (!url) throw new Error("No image supplied");
      ok(res, await profileService.setAvatar(req.user.id, url));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getReferralLink: async (req, res) => {
    try {
      ok(res, await profileService.getReferralLink(req.user.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getMyQualification: async (req, res) => {
    try {
      ok(res, await profileService.getQualificationStatus(req.user.id, req.query.period));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getUserQualification: async (req, res) => {
    try {
      ok(res, await profileService.getQualificationStatus(req.params.id, req.query.period));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  setStatus: async (req, res) => {
    try {
      ok(res, await profileService.setStatus(req.params.id, req.body, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  activate: async (req, res) => {
    try {
      ok(res, await profileService.activate(req.params.id, req.body.reason, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  grantQualification: async (req, res) => {
    try {
      ok(res, await profileService.grantQualification({ userId: req.params.id, ...req.body }, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  revokeQualification: async (req, res) => {
    try {
      ok(res, await profileService.revokeQualification({ userId: req.params.id, ...req.body }, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  submitKyc: async (req, res) => {
    try {
      const data = { ...req.body };
      if (req.files) {
        if (req.files.front) data.frontImageUrl = `/uploads/${req.files.front[0].filename}`;
        if (req.files.back) data.backImageUrl = `/uploads/${req.files.back[0].filename}`;
        if (req.files.selfie) data.selfieImageUrl = `/uploads/${req.files.selfie[0].filename}`;
      }
      const doc = await profileService.submitKyc(req.user.id, data);
      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  approveKyc: async (req, res) => {
    try {
      ok(res, await profileService.approveKyc(req.params.id, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  rejectKyc: async (req, res) => {
    try {
      ok(res, await profileService.rejectKyc(req.params.id, req.user.id, req.body.rejectionReason || req.body.reason));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getKycQueue: async (req, res) => {
    try {
      ok(res, await profileService.getKycQueue());
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = profileController;
