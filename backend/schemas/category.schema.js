const { z } = require("zod");

const categoryBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional()
});

const updateCategoryBodySchema = categoryBodySchema.partial();

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
  categoryBodySchema,
  updateCategoryBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema
};
