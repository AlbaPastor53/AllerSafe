const AppError = require("./utils/appError");

const IA_API_URL = process.env.IA_API_URL || "http://127.0.0.1:3001/api";
const IA_TIMEOUT = 30000;

async function analyzeReviews(comments) {
  let response;

  try {
    response = await fetch(`${IA_API_URL}/reviews/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments }),
      signal: AbortSignal.timeout(IA_TIMEOUT)
    });
  } catch (error) {
    throw new AppError(
      "El servicio de análisis de opiniones no está disponible.",
      502,
      "IA_UNAVAILABLE"
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError(
      payload?.error?.message || "No se han podido analizar las opiniones.",
      502,
      "IA_ERROR"
    );
  }

  if (!payload?.data) {
    throw new AppError(
      "El servicio de análisis no ha devuelto datos.",
      502,
      "IA_EMPTY_RESPONSE"
    );
  }

  return payload.data;
}

module.exports = { analyzeReviews };
