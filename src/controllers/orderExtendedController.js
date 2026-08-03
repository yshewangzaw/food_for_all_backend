const orderExtendedService = require("../services/orderExtendedService");
const PDFDocument = require("pdfkit");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const orderExtendedController = {
  getItems: async (req, res) => {
    try {
      ok(res, await orderExtendedService.getItems(req.params.id));
    } catch (error) {
      fail(res, 500, error);
    }
  },
  getPayments: async (req, res) => {
    try {
      ok(res, await orderExtendedService.getPayments(req.params.id));
    } catch (error) {
      fail(res, 500, error);
    }
  },
  getCommissions: async (req, res) => {
    try {
      ok(res, await orderExtendedService.getCommissions(req.params.id));
    } catch (error) {
      fail(res, 500, error);
    }
  },
  getBuyer: async (req, res) => {
    try {
      ok(res, await orderExtendedService.getBuyer(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  getOrderItemProduct: async (req, res) => {
    try {
      ok(res, await orderExtendedService.getOrderItemProduct(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  getOrderItemPackage: async (req, res) => {
    try {
      ok(res, await orderExtendedService.getOrderItemPackage(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  quote: async (req, res) => {
    try {
      ok(res, await orderExtendedService.quote(req.body.items));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  checkout: async (req, res) => {
    try {
      const { buyerUserId, orderType, items, note } = req.body;
      const result = await orderExtendedService.checkout(
        buyerUserId,
        orderType,
        items,
        note,
      );
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  cancel: async (req, res) => {
    try {
      ok(res, await orderExtendedService.cancel(req.params.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  refund: async (req, res) => {
    try {
      const result = await orderExtendedService.refund(
        req.params.id,
        req.body.reason,
      );
      res.json({ success: true, message: "Order refunded", data: result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getInvoice: async (req, res) => {
    try {
      const { order, items, buyer } = await orderExtendedService.getInvoiceData(
        req.params.id,
      );

      if (req.query.format !== "pdf") {
        return ok(res, { order, items, buyer });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=invoice-${order.orderNumber}.pdf`,
      );

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);

      doc.fontSize(20).text("Food for All — Invoice", { align: "center" });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Order Number: ${order.orderNumber}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      doc.text(`Buyer: ${buyer ? buyer.fullName : "N/A"}`);
      doc.text(`Status: ${order.status}`);
      doc.moveDown();

      doc.font("Helvetica-Bold");
      doc.text("Item", 50, doc.y, { continued: true, width: 220 });
      doc.text("Qty", 270, doc.y, { continued: true, width: 60 });
      doc.text("Unit Price", 330, doc.y, { continued: true, width: 100 });
      doc.text("PV", 430, doc.y);
      doc.font("Helvetica");
      doc.moveDown(0.5);

      for (const item of items) {
        doc.text(item.itemName, 50, doc.y, { continued: true, width: 220 });
        doc.text(String(item.quantity), 270, doc.y, {
          continued: true,
          width: 60,
        });
        doc.text(String(item.unitPrice), 330, doc.y, {
          continued: true,
          width: 100,
        });
        doc.text(String(item.pvTotal), 430, doc.y);
      }

      doc.moveDown();
      doc.font("Helvetica-Bold");
      doc.text(`Subtotal: ${order.subtotal} ETB`);
      doc.text(`Total: ${order.totalAmount} ETB`);
      doc.text(`Total PV: ${order.totalPv}`);

      doc.end();
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getCurrentMonthOrder: async (req, res) => {
    try {
      ok(res, await orderExtendedService.getCurrentMonthOrder(req.user.id));
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getNextOrderNumber: async (req, res) => {
    try {
      ok(res, { orderNumber: await orderExtendedService.getNextOrderNumber() });
    } catch (error) {
      fail(res, 500, error);
    }
  },

  recalculatePv: async (req, res) => {
    try {
      ok(res, await orderExtendedService.recalculatePv(req.params.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  findFiltered: async (req, res) => {
    try {
      const result = await orderExtendedService.findFiltered(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = orderExtendedController;
