const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const eventBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().min(5).max(2000),
  host: z.string().regex(objectIdRegex, "host debe ser un ObjectId válido"),
  categories: z
    .array(z.string().regex(objectIdRegex, "Cada categoría debe ser un ObjectId válido"))
    .min(1, "Debe asignar al menos una categoría"),
  location: z.string().regex(objectIdRegex, "location debe ser un ObjectId válido"),
  classNumber: z.coerce.number().int().min(1, "classNumber debe ser mayor o igual a 1"),
  date: z.coerce.date(),
  time: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "time debe tener formato HH:mm"),
  price: z.coerce.number().min(0),
  capacity: z.coerce.number().int().min(1),
  isActive: z.boolean().optional(),
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

module.exports = {
  eventBodySchema,
  updateEventBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema
};
