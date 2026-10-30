const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, "Debe ser un ObjectId válido");

const departureBodySchema = z.object({
  event: objectId,
  start_datetime: z.coerce.date(),
  end_datetime: z.coerce.date(),
  capacity: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0),
  booked_participants: z.coerce.number().int().min(0).optional(),
  slug: z.string().trim().min(2).max(200).optional(),
  status: z.enum(["scheduled", "full", "cancelled", "completed"]).optional(),
  is_active: z.boolean().optional()
});

const updateDepartureBodySchema = departureBodySchema.partial();

const idParamSchema = z.object({
  id: z.string().min(1)
});

const slugParamSchema = z.object({
  slug: z.string().trim().min(1)
});

const querySchema = z.object({
  event: z.string().regex(objectIdRegex, "event debe ser un ObjectId válido").optional(),
  includeDeleted: z
    .string()
    .optional()
    .transform((value) => value === "true")
});

module.exports = {
  departureBodySchema,
  updateDepartureBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema
};
