const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const corsMiddleware = require("./config/cors");
const chatbotRoutes = require("./routes/chatbot.routes");
const faqRoutes = require("./routes/faq.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: "128kb" }));
app.use(morgan("dev"));

app.use("/api/chatbot", chatbotRoutes);
app.use("/api/faq", faqRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AllerSafe IA API funcionando correctamente"
  });
});

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
