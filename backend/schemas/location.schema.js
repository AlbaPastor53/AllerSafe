const { z } = require("zod");

const locationBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(2).max(255),
  slug: z.string().trim().min(2).max(200).optional(),
  image_url: z
    .string()
    .trim()
    .max(500)
    .regex(/^https?:\/\/.+/i, "La URL de la imagen no es válida")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
  is_active: z.boolean().optional()
});

const updateLocationBodySchema = locationBodySchema.partial();

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

const statusSchema = z.object({
  status: z.enum(["active", "inactive"], {
    error: "status no es válido para ubicación"
  })
});

module.exports = {
  locationBodySchema,
  updateLocationBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema,
  statusSchema
};
