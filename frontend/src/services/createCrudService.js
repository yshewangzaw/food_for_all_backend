import api from "../api/axios";

/**
 * Builds the five standard calls for a backend resource.
 *
 * Every backend controller answers with { success, data }, so each method
 * returns response.data.data — the caller receives plain records, never an
 * envelope.
 *
 * @param {string} basePath  e.g. "/products"
 * @param {(id) => string} byIdPath  e.g. (id) => `/products/${id}`
 */
const createCrudService = (basePath, byIdPath) => ({
  /**
   * NOTE: the backend list endpoints take no query parameters — every
   * controller calls service.getAll() with no filters. Search, sorting and
   * pagination therefore happen in the browser (see hooks/useTableControls).
   * TODO(backend): accept ?page=&limit=&search= and switch DataTable to
   * serverSide mode by passing `params` through here.
   */
  getAll: async (params, config = {}) => {
    const response = await api.get(basePath, { params, ...config });
    return response.data?.data ?? [];
  },

  getById: async (id) => {
    const response = await api.get(byIdPath(id));
    return response.data?.data ?? null;
  },

  create: async (payload) => {
    const response = await api.post(basePath, payload);
    return response.data?.data ?? null;
  },

  update: async (id, payload) => {
    const response = await api.put(byIdPath(id), payload);
    return response.data?.data ?? null;
  },

  remove: async (id) => {
    const response = await api.delete(byIdPath(id));
    return response.data ?? null;
  },
});

export default createCrudService;
