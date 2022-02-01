import express from "express";
import { getLogger } from "./services/logger.js";
import { api } from "./routes/api.js";
import { logRequests, logErrors } from "./services/middleware.js";
const { API_PORT, SERVER_TIMEOUT } = process.env;
const app = express();

// initialize logger
app.locals.logger = getLogger("recurrence-risk");

// register middleware
app.use(logRequests());
app.use("/api", api);
app.use(logErrors());

const server = app.listen(+API_PORT, () => {
  app.locals.logger.info(`Application is running on port: ${API_PORT}`);
});
server.setTimeout(+SERVER_TIMEOUT * 1000);
