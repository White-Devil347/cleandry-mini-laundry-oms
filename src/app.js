const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const env = require("./config/env");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

const app = express();

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});

app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin
  })
);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(limiter);
app.use(express.static(path.join(__dirname, "..", "public")));

app.get(`${env.apiBasePath}/health`, (req, res) => {
  res.json({ status: "ok" });
});

app.use(`${env.apiBasePath}/orders`, orderRoutes);
app.use(`${env.apiBasePath}/dashboard`, dashboardRoutes);

// Alias for versioned path to ease future migration.
app.use(`${env.apiBasePath}/v1/orders`, orderRoutes);
app.use(`${env.apiBasePath}/v1/dashboard`, dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
