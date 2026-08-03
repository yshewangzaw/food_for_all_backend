const userService = require('../services/user.service');
const { sendCsv, sendXlsx } = require('../utils/export');
const { LIST_ATTRIBUTES } = require('../services/user.service');

async function listUsers(req, res, next) {
  try {
    const format = req.query.format || 'json';

    if (format === 'csv' || format === 'xlsx') {
      const rows = await userService.listUsersForExport(req.query);
      const filename = `users-${new Date().toISOString().slice(0, 10)}`;
      return format === 'csv'
        ? sendCsv(res, rows, filename, LIST_ATTRIBUTES)
        : sendXlsx(res, rows, filename, LIST_ATTRIBUTES);
    }

    const result = await userService.listUsers(req.query);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listUsers };