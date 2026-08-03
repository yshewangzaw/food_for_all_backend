const { validationResult } = require('express-validator');

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(422).json({
    message: 'Invalid query parameters',
    errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
  });
};