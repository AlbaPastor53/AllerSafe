const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Debe ser un ObjectId válido");

const commentBodySchema = z.object({
  event_id: objectId,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(1000)
});

const updateCommentBodySchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(5).max(1000).optional()
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "Debes enviar rating o comment."
  });

const eventQuerySchema = z.object({
  event: objectId
});

const idParamSchema = z.object({
  id: objectId
});

const statusSchema = z.object({
  isActive: z.boolean()
});

module.exports = {
  commentBodySchema,
  updateCommentBodySchema,
  eventQuerySchema,
  idParamSchema,
  statusSchema
};
