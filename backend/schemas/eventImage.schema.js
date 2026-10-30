const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, "Debe ser un ObjectId válido");

const eventImageBodySchema = z.object({
  event: objectId,
  url: z.string().trim().min(1, "url es obligatorio"),
  alt: z.string().trim().max(160).optional(),
  position: z.coerce.number().int().min(0).optional(),
  isCover: z.boolean().optional(),
  slug: z.string().trim().min(2).max(160).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  is_active: z.boolean().optional()
});

const updateEventImageBodySchema = eventImageBodySchema.partial();

const idParamSchema = z.object({
  id: z.string().min(1)
});

const slugParamSchema = z.object({
  slug: z.string().trim().min(1)
});

const eventIdParamSchema = z.object({
  eventId: z.string().min(1)
});

const querySchema = z.object({
  event: z.string().regex(objectIdRegex, "event debe ser un ObjectId válido").optional(),
  includeDeleted: z
    .string()
    .optional()
    .transform((value) => value === "true")
});

module.exports = {
  eventImageBodySchema,
  updateEventImageBodySchema,
  idParamSchema,
  slugParamSchema,
  eventIdParamSchema,
  querySchema
};
