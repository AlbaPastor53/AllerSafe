const { z } = require("zod");

const { profileBodySchema } = require("./profile.schema");

const userBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(120),
  role: z.enum(["Admin", "Client"]).optional(),
  slug: z.string().trim().min(2).max(160).optional(),
  status: z.enum(["active", "inactive", "blocked"]).optional(),
  is_active: z.boolean().optional(),
  profile: profileBodySchema.optional()
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

const statusSchema = z.object({
  status: z.enum(["active", "inactive", "blocked"], {
    error: "status no es válido para usuario"
  })
});

module.exports = {
  userBodySchema,
  updateUserBodySchema,
  idParamSchema,
  querySchema,
  statusSchema
};
