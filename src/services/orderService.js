const { GARMENT_PRICING, ORDER_STATUSES } = require("../config/pricing");
const { createOrderId } = require("../utils/id");
const orderRepository = require("../repositories/orderRepository");

function calculateLineItems(items) {
  return items.map((item) => {
    const pricePerItem = GARMENT_PRICING[item.garmentType];
    const lineTotal = pricePerItem * item.quantity;

    return {
      garmentType: item.garmentType,
      quantity: item.quantity,
      pricePerItem,
      lineTotal
    };
  });
}

function calculateTotalAmount(lineItems) {
  return lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
}

function getEstimatedDeliveryDate(daysToAdd = 3) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
}

function createOrder({ customerName, phoneNumber, items }) {
  const lineItems = calculateLineItems(items);
  const totalAmount = calculateTotalAmount(lineItems);
  const sequence = orderRepository.getOrderSequence();
  const orderId = createOrderId(sequence);

  const order = {
    orderId,
    customerName: customerName.trim(),
    phoneNumber: String(phoneNumber),
    items: lineItems,
    totalAmount,
    status: ORDER_STATUSES[0],
    estimatedDeliveryDate: getEstimatedDeliveryDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orderRepository.addOrder(order);

  return order;
}

function updateOrderStatus(orderId, status) {
  const order = orderRepository.findOrderById(orderId);
  if (!order) {
    return null;
  }

  return orderRepository.updateOrder(orderId, {
    status,
    updatedAt: new Date().toISOString()
  });
}

function listOrders({ status, search }) {
  const statusQuery = status ? String(status).trim() : "";
  const searchQuery = search ? String(search).trim().toLowerCase() : "";

  return orderRepository.getAllOrders().filter((order) => {
    const matchesStatus = statusQuery ? order.status === statusQuery : true;
    const matchesSearch = searchQuery
      ? order.customerName.toLowerCase().includes(searchQuery) || order.phoneNumber.includes(searchQuery)
      : true;

    return matchesStatus && matchesSearch;
  });
}

function getDashboardData() {
  const orders = orderRepository.getAllOrders();
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const ordersPerStatus = ORDER_STATUSES.reduce((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, {});

  orders.forEach((order) => {
    ordersPerStatus[order.status] += 1;
  });

  return {
    totalOrders,
    totalRevenue,
    ordersPerStatus
  };
}

module.exports = {
  createOrder,
  updateOrderStatus,
  listOrders,
  getDashboardData,
  ORDER_STATUSES,
  GARMENT_PRICING
};
