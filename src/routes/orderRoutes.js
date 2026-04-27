const express = require("express");
const {
  createOrderHandler,
  updateOrderStatusHandler,
  listOrdersHandler,
  getPricingHandler,
  getStatusesHandler
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrderHandler);
router.patch("/:orderId/status", updateOrderStatusHandler);
router.get("/", listOrdersHandler);
router.get("/meta/pricing", getPricingHandler);
router.get("/meta/statuses", getStatusesHandler);

module.exports = router;
