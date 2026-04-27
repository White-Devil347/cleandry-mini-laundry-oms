const {
  createOrder,
  updateOrderStatus,
  listOrders,
  ORDER_STATUSES,
  GARMENT_PRICING
} = require("../services/orderService");
const { validateCreateOrderPayload, validateStatusPayload } = require("../utils/validators");

function createOrderHandler(req, res) {
  const errors = validateCreateOrderPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors
    });
  }

  const order = createOrder(req.body);
  return res.status(201).json({
    message: "Order created successfully",
    order
  });
}

function updateOrderStatusHandler(req, res) {
  const errors = validateStatusPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors
    });
  }

  const updatedOrder = updateOrderStatus(req.params.orderId, req.body.status);
  if (!updatedOrder) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json({
    message: "Order status updated successfully",
    order: updatedOrder
  });
}

function listOrdersHandler(req, res) {
  const { status, search } = req.query;

  if (status && !ORDER_STATUSES.includes(String(status))) {
    return res.status(400).json({
      message: `Invalid status. Allowed values: ${ORDER_STATUSES.join(", ")}`
    });
  }

  const orders = listOrders({ status, search });
  return res.json({
    count: orders.length,
    orders
  });
}

function getPricingHandler(req, res) {
  return res.json({ pricing: GARMENT_PRICING });
}

function getStatusesHandler(req, res) {
  return res.json({ statuses: ORDER_STATUSES });
}

module.exports = {
  createOrderHandler,
  updateOrderStatusHandler,
  listOrdersHandler,
  getPricingHandler,
  getStatusesHandler
};
