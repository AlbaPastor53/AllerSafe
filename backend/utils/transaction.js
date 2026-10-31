const mongoose = require("mongoose");

const AppError = require("../services/utils/appError");

function isTransactionUnsupported(error) {
  return (
    error &&
    (error.code === 20 ||
      /Transaction numbers are only allowed on a replica set member or mongos/i.test(
        error.message || ""
      ))
  );
}

async function withTransaction(work) {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await work(session);
    });

    return result;
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      // MongoDB standalone no soporta transacciones. En producción exigimos
      // un replica set para no perder atomicidad.
      if (process.env.NODE_ENV === "production") {
        throw new AppError(
          "La base de datos no soporta transacciones. Configura un replica set.",
          500,
          "TRANSACTIONS_UNAVAILABLE"
        );
      }

      console.warn(
        "[db] MongoDB standalone detectado: la operación se ejecuta sin transacción."
      );

      return await work(null);
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

module.exports = { withTransaction };
