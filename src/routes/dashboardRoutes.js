const express = require("express");
const { getDashboardHandler } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", getDashboardHandler);

module.exports = router;
