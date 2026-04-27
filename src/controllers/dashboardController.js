const { getDashboardData } = require("../services/orderService");

function getDashboardHandler(req, res) {
  const dashboard = getDashboardData();
  return res.json(dashboard);
}

module.exports = {
  getDashboardHandler
};
