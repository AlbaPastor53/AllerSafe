const { z } = require("zod");

const reviewCommentSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  rating: z.number().int().min(1).max(5)
});

const reviewBodySchema = z.object({
  comments: z.array(reviewCommentSchema).min(1).max(50)
});

module.exports = { reviewBodySchema };
