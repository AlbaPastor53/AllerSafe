const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, "Debe ser un ObjectId válido");

const userBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(120),
  role: z.enum(["Admin", "Client"]).optional(),
  slug: z.string().trim().min(2).max(160).optional(),
  status: z.enum(["active", "inactive", "blocked"]).optional(),
  is_active: z.boolean().optional()
});

const updateUserBodySchema = userBodySchema.partial();

const idParamSchema = z.object({
  id: z.string().min(1)
});

const querySchema = z.object({
  includeDeleted: z
    .string()
    .optional()
    .transform((value) => value === "true")
});

module.exports = {
  userBodySchema,
  updateUserBodySchema,
  idParamSchema,
  querySchema
};
