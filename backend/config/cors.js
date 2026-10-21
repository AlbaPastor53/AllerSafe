const cors = require("cors");

// Permite el origen configurado y los dos hosts habituales de Angular en local.
// CORS_ORIGIN puede contener varios orígenes separados por comas.
const configuredOrigins = (process.env.CORS_ORIGIN || "http://localhost:4200,http://127.0.0.1:4200")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Las peticiones sin Origin (curl, Postman y comprobaciones locales) se permiten.
    if (!origin || configuredOrigins.includes("*") || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origen bloqueado por CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = cors(corsOptions);
