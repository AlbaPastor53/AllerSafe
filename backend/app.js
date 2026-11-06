const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const corsMiddleware = require("./config/cors");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const eventRoutes = require("./routes/event.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const locationRoutes = require("./routes/location.routes");
const eventImageRoutes = require("./routes/eventImage.routes");
const hostRoutes = require("./routes/host.routes");
const departureRoutes = require("./routes/departure.routes");
const errorHandler = require("./middlewares/errorHandler");
const { authentication } = require("./middlewares/authentication");
const { admin } = require("./middlewares/admin");

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(cookieParser());
// El avatar se guarda como data URL base64; el límite por defecto (100 KB) no basta.
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Las lecturas del catálogo son públicas; toda mutación exige rol Admin.
function adminOnlyMutations(req, res, next) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  authentication(req, res, (error) => {
    if (error) return next(error);
    return admin(req, res, next);
  });
}

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AllerSafe API funcionando correctamente"
  });
});

app.use("/api/profile", authentication, profileRoutes);
app.use("/api/users", authentication, admin, userRoutes);
app.use("/api/events", adminOnlyMutations, eventRoutes);
app.use("/api/categories", adminOnlyMutations, categoryRoutes);
app.use("/api/locations", adminOnlyMutations, locationRoutes);
app.use("/api/event-images", adminOnlyMutations, eventImageRoutes);
app.use("/api/hosts", adminOnlyMutations, hostRoutes);
app.use("/api/departures", adminOnlyMutations, departureRoutes);

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
