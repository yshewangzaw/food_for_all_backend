const { query } = require('express-validator');

const USER_STATUSES = ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED'];
const KYC_STATUSES = ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'];
const SORTABLE = ['createdAt', 'fullName', 'directReferralCount', 'depth'];

const listUsersQuery = [
  query('role').optional().isIn(['ADMIN', 'MEMBER']),
  query('status').optional().isIn(USER_STATUSES),
  query('kycStatus').optional().isIn(KYC_STATUSES),
  query('city').optional().trim().isLength({ max: 100 }),
  query('sponsorId').optional().isInt({ min: 1 }).toInt(),
  query('depth').optional().isInt({ min: 0 }).toInt(),
  query('minDepth').optional().isInt({ min: 0 }).toInt(),
  query('maxDepth').optional().isInt({ min: 0 }).toInt(),
  query('minDirectReferrals').optional().isInt({ min: 0 }).toInt(),
  query('activated').optional().isBoolean().toBoolean(),
  query('phoneVerified').optional().isBoolean().toBoolean(),
  query('hasWalletBalance').optional().isBoolean().toBoolean(),
  query('createdFrom').optional().isISO8601().toDate(),
  query('createdTo').optional().isISO8601().toDate(),
  query('search').optional().trim().isLength({ min: 1, max: 100 }),
  query('sort').optional().isIn(SORTABLE),
  query('order').optional().isIn(['asc', 'desc', 'ASC', 'DESC']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('format').optional().isIn(['json', 'csv', 'xlsx']),
];

module.exports = { listUsersQuery, SORTABLE };