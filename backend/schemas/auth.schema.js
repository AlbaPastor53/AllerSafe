const { z } = require("zod");

const loginBodySchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(120)
});

module.exports = {
  loginBodySchema
};
