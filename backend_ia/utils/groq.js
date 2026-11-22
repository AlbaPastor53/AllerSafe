function validateGroqConfig() {
  if (!process.env.GROQ_API_KEY || !process.env.GROQ_API_KEY.trim()) {
    throw new Error(
      "GROQ_API_KEY no está definida en las variables de entorno. Copia .env.example a .env y añade tu clave de Groq."
    );
  }
}

module.exports = { validateGroqConfig };
