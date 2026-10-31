require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { validateJwtConfig } = require("./utils/jwt");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    validateJwtConfig();
    await connectDB();

    app.listen(PORT, () => {
      console.log(`AllerSafe API escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    console.error(
      "Comprueba que MongoDB esté en marcha, que MONGODB_URI sea correcta y que JWT_SECRET tenga al menos 32 caracteres."
    );
    process.exit(1);
  }
}

startServer();
