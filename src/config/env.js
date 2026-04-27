const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  apiBasePath: process.env.API_BASE_PATH || "/api",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 300),
  storageMode: process.env.STORAGE_MODE || "memory",
  dataFilePath: process.env.DATA_FILE_PATH || path.join(process.cwd(), "data", "orders.json")
};

module.exports = env;
