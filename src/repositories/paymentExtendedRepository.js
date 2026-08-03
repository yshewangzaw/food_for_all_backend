const {
  Payment,
  Order,
  PaymentMethod,
  User,
  Notification,
} = require("../models");
const sequelize = require("../config/database");
const { Op } = require("sequelize");
const commissionBusinessRepository = require("./commissionBusinessRepository");

const paymentExtendedRepository = {
  getOrder: async (paymentId) => {
    const p = await Payment.findByPk(paymentId);
    if (!p) throw new Error("Payment not found");
    return await Order.findByPk(p.orderId);
  },

  getMethod: async (paymentId) => {
    const p = await Payment.findByPk(paymentId);
    if (!p) throw new Error("Payment not found");
    return await PaymentMethod.findByPk(p.paymentMethodId);
  },

  getUser: async (paymentId) => {
    const p = await Payment.findByPk(paymentId);
    if (!p) throw new Error("Payment not found");
    if (!p.userId) return null;
    return await User.findByPk(p.userId);
  },

  getReviewer: async (paymentId) => {
    const p = await Payment.findByPk(paymentId);
    if (!p) throw new Error("Payment not found");
    if (!p.reviewedById) return null;
    return await User.findByPk(p.reviewedById);
  },

  create: async (data) => {
    const order = await Order.findByPk(data.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING_PAYMENT") {
      throw new Error(
        `Cannot submit payment — order status is ${order.status}`,
      );
    }

    return await Payment.create({
      orderId: data.orderId,
      userId: data.userId || null,
      paymentMethodId: data.paymentMethodId,
      amount: data.amount,
      referenceNo: data.referenceNo || null,
      proofImageUrl: data.proofImageUrl || null,
      status: "SUBMITTED",
    });
  },

  /**
   * THE critical transaction. Order -> PAID, activate user if needed,
   * process commissions, notify. All or nothing for the payment/order/user
   * part; commission processing runs in its own transaction afterward
   * (see comment inline below for why).
   */
  approve: async (paymentId, reviewerId) => {
    const t = await sequelize.transaction();
    let payment, order, buyer;

    try {
      payment = await Payment.findByPk(paymentId, { transaction: t });
      if (!payment) throw new Error("Payment not found");
      if (payment.status !== "SUBMITTED") {
        throw new Error(
          `Cannot approve a payment with status ${payment.status}`,
        );
      }

      order = await Order.findByPk(payment.orderId, { transaction: t });
      if (!order) throw new Error("Associated order not found");
      if (order.status !== "PENDING_PAYMENT") {
        throw new Error(
          `Order is already ${order.status}, cannot approve payment`,
        );
      }

      await payment.update(
        {
          status: "APPROVED",
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
        { transaction: t },
      );

      await order.update({ status: "PAID" }, { transaction: t });

      buyer = null;
      if (order.buyerUserId) {
        buyer = await User.findByPk(order.buyerUserId, { transaction: t });
        if (buyer && order.orderType === "ACTIVATION" && !buyer.activatedAt) {
          await buyer.update(
            { status: "ACTIVE", activatedAt: new Date() },
            { transaction: t },
          );
        }
      }

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    // Commission processing runs in its OWN transaction (the engine manages
    // that internally) — deliberately outside the payment/order transaction
    // above, so a commission-calc bug never blocks the payment itself from
    // being recorded as approved. If commissions fail here, the order stays
    // PAID and commissionStatus stays NOT_PROCESSED for manual retry via
    // POST /orders/:id/commissions/process.
    let commissionResult = null;
    try {
      commissionResult = await commissionBusinessRepository.processOrder(
        order.id,
      );
      await order.update({ commissionStatus: "PROCESSED" });
    } catch (commissionError) {
      commissionResult = { error: commissionError.message };
    }

    if (buyer) {
      await Notification.create({
        userId: buyer.id,
        category: "PAYMENT",
        title: "Payment approved",
        body: `Your payment for order ${order.orderNumber} has been approved.`,
        isRead: false,
      });
    }

    return {
      payment,
      order,
      buyerActivated: !!(buyer && buyer.activatedAt),
      commissionResult,
    };
  },

  reject: async (paymentId, reviewerId, rejectionReason) => {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.status !== "SUBMITTED") {
      throw new Error(`Cannot reject a payment with status ${payment.status}`);
    }

    await payment.update({
      status: "REJECTED",
      reviewedById: reviewerId,
      reviewedAt: new Date(),
      rejectionReason,
    });

    if (payment.userId) {
      await Notification.create({
        userId: payment.userId,
        category: "PAYMENT",
        title: "Payment rejected",
        body: `Your payment was rejected: ${rejectionReason}`,
        isRead: false,
      });
    }

    return payment;
  },

  cancel: async (paymentId, requestingUserId) => {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.userId !== requestingUserId) {
      throw new Error("You can only cancel your own payment submissions");
    }
    if (payment.status !== "SUBMITTED") {
      throw new Error(`Cannot cancel a payment with status ${payment.status}`);
    }

    await payment.update({ status: "CANCELLED" });
    return payment;
  },

  resubmitProof: async (paymentId, proofImageUrl) => {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.status !== "SUBMITTED" && payment.status !== "REJECTED") {
      throw new Error(
        `Cannot resubmit proof for a payment with status ${payment.status}`,
      );
    }

    await payment.update({
      proofImageUrl,
      status: "SUBMITTED",
      rejectionReason: null,
    });
    return payment;
  },

  getQueue: async () => {
    return await Payment.findAll({
      where: { status: "SUBMITTED" },
      order: [["createdAt", "ASC"]],
      include: [{ model: Order, as: "order" }],
    });
  },

  checkReference: async (referenceNo) => {
    const matches = await Payment.findAll({
      where: { referenceNo, status: { [Op.in]: ["SUBMITTED", "APPROVED"] } },
    });
    return { isDuplicate: matches.length > 0, matches };
  },

  bulkApprove: async (paymentIds, reviewerId) => {
    const results = { approved: [], failed: [] };
    for (const id of paymentIds) {
      try {
        await paymentExtendedRepository.approve(id, reviewerId);
        results.approved.push(id);
      } catch (error) {
        results.failed.push({ id, reason: error.message });
      }
    }
    return results;
  },
};

module.exports = paymentExtendedRepository;
