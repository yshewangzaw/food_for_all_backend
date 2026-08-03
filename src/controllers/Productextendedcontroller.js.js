const productExtendedService = require("../services/productExtendedService");
const XLSX = require("xlsx");
const fs = require("fs");
const { parse: parseCsv } = require("csv-parse/sync");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const productExtendedController = {
  getPackagesContaining: async (req, res) => {
    try {
      const packages = await productExtendedService.getPackagesContaining(req.params.id);
      ok(res, packages);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getOrderItems: async (req, res) => {
    try {
      const items = await productExtendedService.getOrderItems(req.params.id);
      ok(res, items);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  activate: async (req, res) => {
    try {
      const product = await productExtendedService.activate(req.params.id);
      ok(res, product);
    } catch (error) {
      fail(res, 404, error);
    }
  },

  deactivate: async (req, res) => {
    try {
      const product = await productExtendedService.deactivate(req.params.id);
      ok(res, product);
    } catch (error) {
      fail(res, 404, error);
    }
  },

  uploadImage: async (req, res) => {
    try {
      if (!req.file) throw new Error("No image file provided");
      const imageUrl = `/uploads/${req.file.filename}`;
      const product = await productExtendedService.setImage(req.params.id, imageUrl);
      ok(res, product);
    } catch (error) {
      fail(res, 400, error);
    }
  },

  bulkImport: async (req, res) => {
    try {
      if (!req.file) throw new Error("No catalog file provided");

      const dryRun = req.query.dryRun === "true";
      const ext = req.file.originalname.split(".").pop().toLowerCase();

      let rows;
      if (ext === "csv") {
        const content = fs.readFileSync(req.file.path, "utf8");
        rows = parseCsv(content, { columns: true, skip_empty_lines: true });
      } else {
        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet);
      }

      const result = await productExtendedService.bulkImport(rows, dryRun);

      // clean up the uploaded file either way
      fs.unlink(req.file.path, () => {});

      res.json({
        success: true,
        dryRun,
        message: dryRun
          ? "Dry run complete — no products were created"
          : `${result.created} product(s) created`,
        data: result,
      });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getCategories: async (req, res) => {
    try {
      const categories = await productExtendedService.getCategories();
      ok(res, categories);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getSalesStats: async (req, res) => {
    try {
      const stats = await productExtendedService.getSalesStats(
        req.params.id,
        req.query.from,
        req.query.to
      );
      ok(res, stats);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  findFiltered: async (req, res) => {
    try {
      const result = await productExtendedService.findFiltered(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = productExtendedController;