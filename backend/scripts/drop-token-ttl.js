require("dotenv").config();

const mongoose = require("mongoose");
const AccessToken = require("../models/accessToken.model");
const RefreshToken = require("../models/refreshToken.model");

async function dropTtlIndex(model) {
  const collection = model.collection;
  const indexes = await collection.indexes();
  const hasTtl = indexes.some((index) => index.name === "expires_at_1");

  if (!hasTtl) {
    console.log(`${collection.collectionName}: sin índice TTL`);
    return;
  }

  await collection.dropIndex("expires_at_1");
  console.log(`${collection.collectionName}: índice TTL eliminado`);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI no está definida.");
  }

  await mongoose.connect(uri);

  try {
    await dropTtlIndex(AccessToken);
    await dropTtlIndex(RefreshToken);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("No se pudieron eliminar los índices TTL:", error.message);
  process.exit(1);
});
