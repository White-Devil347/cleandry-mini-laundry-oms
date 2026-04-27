const app = require("./app");
const env = require("./config/env");

const server = app.listen(env.port, () => {
  console.log(`CleanDry server running on http://localhost:${env.port}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}. Closing server...`);
  server.close(() => {
    console.log("Server closed cleanly.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
