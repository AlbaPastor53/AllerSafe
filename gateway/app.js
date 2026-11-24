const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3000";
const IA_URL = process.env.IA_URL || "http://127.0.0.1:3001";
const IA_TIMEOUT = Number(process.env.IA_TIMEOUT) || 60000;

const configuredOrigins = (process.env.CORS_ORIGIN || "http://localhost:4200,http://127.0.0.1:4200")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.disable("x-powered-by");
app.use(morgan(process.env.LOG_LEVEL || "dev"));
app.use(
  cors({
    origin(origin, callback) {
      // Las peticiones sin Origin (curl, health checks) se permiten.
      if (!origin || configuredOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origen bloqueado por CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

function onProxyError(service) {
  return (error, req, res) => {
    console.error(`[gateway] No se pudo contactar con ${service}: ${error.message}`);
    if (res.headersSent) return;

    res.status(502).json({
      success: false,
      error: {
        code: "BAD_GATEWAY",
        message: `El servicio ${service} no está disponible.`
      }
    });
  };
}

function isIaPath(pathname) {
  return (
    pathname === "/api/chatbot" ||
    pathname.startsWith("/api/chatbot/") ||
    pathname === "/api/faq" ||
    pathname.startsWith("/api/faq/") ||
    pathname === "/api/ia/health"
  );
}

// Los proxies se registran sin prefijo de montaje: Express 5 recortaría la ruta
// y el backend recibiría `/health` en lugar de `/api/health`.
// El backend IA va primero porque sus rutas son más específicas que `/api`.
app.use(
  createProxyMiddleware({
    target: IA_URL,
    changeOrigin: true,
    pathFilter: ["/api/chatbot", "/api/faq"],
    timeout: IA_TIMEOUT,
    proxyTimeout: IA_TIMEOUT,
    on: { error: onProxyError("backend_ia") }
  })
);

// Alias para consultar la salud de la IA sin chocar con el `/api/health` del backend.
app.use(
  createProxyMiddleware({
    target: IA_URL,
    changeOrigin: true,
    pathFilter: "/api/ia/health",
    pathRewrite: { "^/api/ia/health": "/api/health" },
    on: { error: onProxyError("backend_ia") }
  })
);

// Todo lo demás bajo /api va a la API REST principal (rutas sin reescribir).
app.use(
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathFilter: (pathname) =>
      (pathname === "/api" || pathname.startsWith("/api/")) && !isIaPath(pathname),
    on: { error: onProxyError("backend") }
  })
);

async function checkService(name, url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const body = await response.json().catch(() => null);

    return {
      service: name,
      ok: response.ok,
      status: response.status,
      body
    };
  } catch (error) {
    return {
      service: name,
      ok: false,
      error: error.message
    };
  }
}

app.get("/health", async (req, res) => {
  const services = await Promise.all([
    checkService("backend", `${BACKEND_URL}/api/health`),
    checkService("backend_ia", `${IA_URL}/api/health`)
  ]);

  const ok = services.every((service) => service.ok);

  res.status(ok ? 200 : 503).json({
    success: ok,
    services
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Ruta no encontrada en el gateway."
    }
  });
});

app.use((error, req, res, next) => {
  console.error("[gateway]", error.message);

  res.status(403).json({
    success: false,
    error: {
      code: "GATEWAY_ERROR",
      message: error.message
    }
  });
});

module.exports = app;
