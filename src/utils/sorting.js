function buildOrder(query, allowedFields, fallback = 'createdAt') {
  const field = allowedFields.includes(query.sort) ? query.sort : fallback;
  const dir = String(query.order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return [[field, dir]];
}

module.exports = { buildOrder };