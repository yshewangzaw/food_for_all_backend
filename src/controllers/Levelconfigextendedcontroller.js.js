const levelConfigExtendedService = require("../services/levelConfigExtendedService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const levelConfigExtendedController = {
  getRules: async (req, res) => {
    try {
      ok(res, await levelConfigExtendedService.getRules(req.params.id));
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getActive: async (req, res) => {
    try {
      const config = await levelConfigExtendedService.getActive();
      if (!config)
        return res
          .status(404)
          .json({ success: false, message: "No active level configuration" });
      ok(res, config);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  activate: async (req, res) => {
    try {
      ok(res, await levelConfigExtendedService.activate(req.params.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  deactivate: async (req, res) => {
    try {
      ok(res, await levelConfigExtendedService.deactivate(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  clone: async (req, res) => {
    try {
      const result = await levelConfigExtendedService.clone(req.params.id);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      fail(res, 404, error);
    }
  },

  findFiltered: async (req, res) => {
    try {
      ok(res, await levelConfigExtendedService.findFiltered(req.query));
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = levelConfigExtendedController;
