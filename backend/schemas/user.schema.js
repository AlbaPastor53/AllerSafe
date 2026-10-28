const { z } = require("zod");

const userBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  role: z.enum(["user", "teacher", "admin"]).optional(),
  isActive: z.boolean().optional()
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
