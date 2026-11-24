const { z } = require("zod");

const { profileBodySchema } = require("./profile.schema");

const loginBodySchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(120)
});

// strict() rechaza campos extra: el registro público no puede pedir role Admin.
const registerBodySchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
    password: z.string().min(8).max(120),
    profile: profileBodySchema.optional()
  })
  .strict();

module.exports = {
  loginBodySchema,
  registerBodySchema
};
