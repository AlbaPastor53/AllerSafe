require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`AllerSafe API escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    console.error("Comprueba que MongoDB esté en marcha y que MONGODB_URI en .env sea correcta.");
    process.exit(1);
  }
}

startServer();
