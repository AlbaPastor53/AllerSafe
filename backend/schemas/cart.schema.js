const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, "Debe ser un ObjectId válido");

const addItemBodySchema = z.object({
  departure: objectId
});

module.exports = {
  addItemBodySchema
};
