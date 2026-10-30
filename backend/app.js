const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const corsMiddleware = require("./config/cors");
const eventRoutes = require("./routes/event.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const locationRoutes = require("./routes/location.routes");
const eventImageRoutes = require("./routes/eventImage.routes");
const hostRoutes = require("./routes/host.routes");
const departureRoutes = require("./routes/departure.routes");
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
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/event-images", eventImageRoutes);
app.use("/api/hosts", hostRoutes);
app.use("/api/departures", departureRoutes);

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
