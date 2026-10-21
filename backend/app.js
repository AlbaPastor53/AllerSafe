const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const corsMiddleware = require("./config/cors");
const eventRoutes = require("./routes/event.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AllerSafe API funcionando correctamente"
  });
});

app.use("/api/events", eventRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Ruta no encontrada."
    }
  });
});

app.use(errorHandler);

module.exports = app;
