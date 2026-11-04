const cors = require("cors");

// CORS_ORIGIN debe contener los orígenes exactos separados por comas.
const configuredOrigins = (process.env.CORS_ORIGIN || "http://localhost:4200,http://127.0.0.1:4200")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Las peticiones sin Origin se permiten.
    if (!origin || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origen bloqueado por CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = cors(corsOptions);
