const MAX_LIMIT = 100;

function getPagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 25;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit, offset: (page - 1) * limit };
}

function buildMeta({ count, page, limit }) {
  return {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit) || 1,
  };
}

module.exports = { getPagination, buildMeta, MAX_LIMIT };