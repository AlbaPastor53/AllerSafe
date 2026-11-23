const { z } = require("zod");

const faqEventSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).default(""),
  categories: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  host: z.string().trim().max(200).default(""),
  location: z.string().trim().max(200).default(""),
  classNumber: z.number().int().nonnegative().optional(),
  date: z.string().trim().max(50).default(""),
  time: z.string().trim().max(50).default(""),
  price: z.number().nonnegative().optional(),
  capacity: z.number().int().nonnegative().optional()
});

const faqBodySchema = z.object({
  event: faqEventSchema
});

module.exports = { faqBodySchema };
