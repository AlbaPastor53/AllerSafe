const { z } = require("zod");

const eventBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().min(5).max(2000),
  date: z.coerce.date(),
  price: z.coerce.number().min(0),
  category: z.enum(["alergias", "cocina", "reposteria", "nutricion", "seguridad"]),
  capacity: z.coerce.number().int().min(1),
  isActive: z.boolean().optional(),
  status: z.enum(["draft", "published", "cancelled", "completed"]).optional()
});

const updateEventBodySchema = eventBodySchema.partial();

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
  eventBodySchema,
  updateEventBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema
};
