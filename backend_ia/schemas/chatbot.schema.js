const { z } = require("zod");

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000)
});

const chatBodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(30)
});

module.exports = { chatBodySchema };
