const { User } = require('../models');
const { buildUserWhere } = require('./user.filter');
const { getPagination, buildMeta } = require('../utils/pagination');
const { buildOrder } = require('../utils/sorting');
const { SORTABLE } = require('../validators/user.validator');

const LIST_ATTRIBUTES = [
  'id', 'fullName', 'email', 'phone', 'role', 'referralCode',
  'sponsorId', 'depth', 'directReferralCount', 'status',
  'activatedAt', 'phoneVerifiedAt', 'kycStatus', 'city',
  'wallet', 'avatarUrl', 'createdAt',
];

async function listUsers(q) {
  const { page, limit, offset } = getPagination(q);
  const where = buildUserWhere(q);
  const order = buildOrder(q, SORTABLE);

  const { rows, count } = await User.findAndCountAll({
    where,
    order,
    limit,
    offset,
    attributes: LIST_ATTRIBUTES,      // never leak passwordHash
    include: [
      {
        model: User,
        as: 'sponsor',
        attributes: ['id', 'fullName', 'referralCode'],
        required: false,               // LEFT JOIN — root user has no sponsor
      },
    ],
    distinct: true,                    // correct count when joins are present
    subQuery: false,
  });

  return { data: rows, meta: buildMeta({ count, page, limit }) };
}

// Used by the ?format=csv|xlsx export path — no pagination, capped
async function listUsersForExport(q, cap = 10000) {
  const where = buildUserWhere(q);
  const order = buildOrder(q, SORTABLE);

  return User.findAll({
    where,
    order,
    limit: cap,
    attributes: LIST_ATTRIBUTES,
    raw: true,
  });
}

module.exports = { listUsers, listUsersForExport, LIST_ATTRIBUTES };