require("dotenv").config();

const app = require("./app");
const { validateGroqConfig } = require("./utils/groq");

const PORT = process.env.PORT || 3001;

function startServer() {
  try {
    validateGroqConfig();

    app.listen(PORT, () => {
      console.log(`AllerSafe IA API escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    console.error(
      "Comprueba que GROQ_API_KEY esté definida en .env y sea válida."
    );
    process.exit(1);
  }
}

startServer();
