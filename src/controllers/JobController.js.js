const jobRunner = require("../services/jobRunner");
require("../services/jobService"); // registers every job on the runner

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

// Each POST returns a runId immediately; poll GET /jobs/:runId/status.
const trigger = (jobName) => (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    if (req.params.userId) params.userId = req.params.userId;
    ok(res, jobRunner.start(jobName, params, req.user ? req.user.id : null));
  } catch (error) {
    fail(res, 400, error);
  }
};

const jobController = {
  qualificationRun: trigger("qualification-run"),
  deactivateLapsed: trigger("deactivate-lapsed"),
  commissionBatchCredit: trigger("commission-batch-credit"),
  networkRebuild: trigger("network-rebuild"),
  walletReconcile: trigger("wallet-reconcile"),
  qualificationReminder: trigger("qualification-reminder"),
  paymentExpiry: trigger("payment-expiry"),
  notificationEmailRetry: trigger("notification-email-retry"),
  qualificationBackfill: trigger("qualification-backfill"),

  list: (req, res) => {
    try {
      ok(res, jobRunner.list());
    } catch (error) {
      fail(res, 500, error);
    }
  },

  status: (req, res) => {
    try {
      ok(res, jobRunner.status(req.params.runId));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  history: (req, res) => {
    try {
      ok(res, jobRunner.history(req.query));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  cancel: (req, res) => {
    try {
      ok(res, jobRunner.cancel(req.params.runId));
    } catch (error) {
      fail(res, 400, error);
    }
  },
};

module.exports = jobController;