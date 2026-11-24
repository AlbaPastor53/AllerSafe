require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API Gateway de AllerSafe escuchando en http://localhost:${PORT}`);
});
