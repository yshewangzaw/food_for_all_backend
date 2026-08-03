const walletExtendedService = require("../services/walletExtendedService");
const { sendCsv, sendXlsx } = require("../utils/export");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const STATEMENT_FIELDS = [
  "id",
  "createdAt",
  "transactionType",
  "direction",
  "amount",
  "balanceBefore",
  "balanceAfter",
  "referenceType",
  "referenceId",
  "description",
];

const walletExtendedController = {
  // GET /api/me/wallet
  getMyBalance: async (req, res) => {
    try {
      ok(res, await walletExtendedService.getBalance(req.user.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  // GET /api/users/:id/wallet
  getUserBalance: async (req, res) => {
    try {
      ok(res, await walletExtendedService.getBalance(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  // GET /api/me/wallet/transactions
  getMyTransactions: async (req, res) => {
    try {
      const result = await walletExtendedService.getTransactions(
        req.user.id,
        req.query,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // GET /api/users/:id/wallet/transactions
  getUserTransactions: async (req, res) => {
    try {
      const result = await walletExtendedService.getTransactions(
        req.params.id,
        req.query,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // GET /api/wallet-transactions/:id/reference
  getReference: async (req, res) => {
    try {
      ok(res, await walletExtendedService.getReference(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  // GET /api/wallet-transactions/:id/created-by
  getCreatedBy: async (req, res) => {
    try {
      ok(res, await walletExtendedService.getCreatedBy(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  // GET /api/me/wallet/statement?from=&to=&format=
  getMyStatement: async (req, res) => {
    try {
      const statement = await walletExtendedService.getStatement(
        req.user.id,
        req.query,
      );
      const format = req.query.format || "json";
      const filename = `wallet-statement-${req.user.id}`;

      if (format === "csv")
        return sendCsv(res, statement.transactions, filename, STATEMENT_FIELDS);
      if (format === "xlsx")
        return sendXlsx(res, statement.transactions, filename, STATEMENT_FIELDS);

      ok(res, statement);
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getUserStatement: async (req, res) => {
    try {
      const statement = await walletExtendedService.getStatement(
        req.params.id,
        req.query,
      );
      const format = req.query.format || "json";
      const filename = `wallet-statement-${req.params.id}`;

      if (format === "csv")
        return sendCsv(res, statement.transactions, filename, STATEMENT_FIELDS);
      if (format === "xlsx")
        return sendXlsx(res, statement.transactions, filename, STATEMENT_FIELDS);

      ok(res, statement);
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // POST /api/admin/wallet/adjustments
  adjust: async (req, res) => {
    try {
      const row = await walletExtendedService.adjust(req.body, req.user.id);
      res.status(201).json({ success: true, data: row });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // POST /api/admin/wallet/reversal
  reverse: async (req, res) => {
    try {
      const row = await walletExtendedService.reverse(req.body, req.user.id);
      res.status(201).json({ success: true, data: row });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // GET /api/admin/wallet/reconcile
  reconcile: async (req, res) => {
    try {
      const result = await walletExtendedService.reconcile();
      res.status(result.healthy ? 200 : 409).json({ success: true, data: result });
    } catch (error) {
      fail(res, 500, error);
    }
  },

  // GET /api/admin/wallet/liability
  getLiability: async (req, res) => {
    try {
      ok(res, await walletExtendedService.getLiability());
    } catch (error) {
      fail(res, 500, error);
    }
  },

  // GET /api/wallet-transactions (filtered)
  findFiltered: async (req, res) => {
    try {
      const result = await walletExtendedService.findFiltered(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 400, error);
    }
  },
};

module.exports = walletExtendedController;