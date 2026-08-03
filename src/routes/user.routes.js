const router = require('express').Router();

const { listUsers } = require('../controllers/user.controller');
const { listUsersQuery } = require('../validators/user.validator');

const validate = require('../middleware/validate');
const authenticate = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET /api/users — admin only
router.get(
  '/',
  authenticate,
  requireRole('ADMIN'),
  listUsersQuery,
  validate,
  listUsers
);

module.exports = router;