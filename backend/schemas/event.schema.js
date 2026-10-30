const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, "Debe ser un ObjectId válido");

const eventBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().min(5).max(2000),
  host: objectId,
  categories: z.array(objectId).min(1, "Debe asignar al menos una categoría"),
  location: objectId,
  classNumber: z.coerce.number().int().min(1, "classNumber debe ser mayor o igual a 1"),
  date: z.coerce.date(),
  time: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "time debe tener formato HH:mm"),
  price: z.coerce.number().min(0),
  capacity: z.coerce.number().int().min(1),
  is_active: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional()
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

const hostBodySchema = z.object({
  host: objectId
});

const locationBodySchema = z.object({
  location: objectId
});

const categoriesBodySchema = z.object({
  categories: z.array(objectId).min(1, "Debe indicar al menos una categoría")
});

const categoryParamSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1)
});

module.exports = {
  eventBodySchema,
  updateEventBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema,
  hostBodySchema,
  locationBodySchema,
  categoriesBodySchema,
  categoryParamSchema
};
