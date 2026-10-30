const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const hostBodySchema = z.object({
  user_id: z.string().regex(objectIdRegex, "user_id debe ser un ObjectId válido"),
  biography: z.string().trim().max(1000).optional(),
  slug: z.string().trim().min(2).max(160).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  is_active: z.boolean().optional()
});

const updateHostBodySchema = hostBodySchema.partial();

const idParamSchema = z.object({
  id: z.string().min(1)
});

const slugParamSchema = z.object({
  slug: z.string().trim().min(1)
});

const querySchema = z.object({
  includeDeleted: z
    .string()
    .optional()
    .transform((value) => value === "true")
});

module.exports = {
  hostBodySchema,
  updateHostBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema
};
