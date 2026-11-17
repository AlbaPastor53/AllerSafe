const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, "Debe ser un ObjectId válido");

const toArray = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (Array.isArray(value)) return value;

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const objectIdArray = z.preprocess(
  toArray,
  z
    .array(objectId)
    .max(20, "No se pueden aplicar más de 20 valores")
    .optional()
);

const optionalPrice = z.preprocess(
  (value) =>
    value === undefined || value === null || value === "" ? undefined : value,
  z.coerce.number().min(0, "El precio no puede ser negativo").optional()
);

const shopEventsQuerySchema = z
  .object({
    search: z.string().trim().max(120).optional(),
    category: objectIdArray,
    host: objectIdArray,
    location: objectIdArray,
    minPrice: optionalPrice,
    maxPrice: optionalPrice,
    sort: z
      .enum([
        "date_asc",
        "date_desc",
        "price_asc",
        "price_desc",
        "name_asc",
        "name_desc"
      ])
      .optional(),
    limit: z.coerce.number().int().min(1).max(24).default(4),
    offset: z.coerce.number().int().min(0).default(0)
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "minPrice no puede ser mayor que maxPrice",
      path: ["minPrice"]
    }
  );

const shopHomeQuerySchema = z.object({
  eventsLimit: z.coerce.number().int().min(1).max(24).default(8),
  filterLimit: z.coerce.number().int().min(1).max(100).default(50)
});

const shopSlugParamSchema = z.object({
  slug: z.string().trim().min(1)
});

module.exports = {
  shopEventsQuerySchema,
  shopHomeQuerySchema,
  shopSlugParamSchema
};
