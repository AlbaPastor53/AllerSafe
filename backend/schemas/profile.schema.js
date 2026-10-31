const { z } = require("zod");

const profileBodySchema = z
  .object({
    first_name: z.string().trim().min(1).max(80).optional(),
    last_name: z.string().trim().min(1).max(80).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[\d\s().-]{6,30}$/, "El teléfono no tiene un formato válido")
      .optional(),
    birth_date: z.coerce
      .date()
      .refine((date) => date <= new Date(), "La fecha de nacimiento no puede ser futura")
      .optional(),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    postal_code: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9 -]{3,20}$/, "El código postal no tiene un formato válido")
      .optional(),
    avatar_url: z.string().trim().url("La URL del avatar no es válida").max(500).optional(),
    bio: z.string().trim().max(1000).optional(),
    allergies: z
      .array(z.string().trim().min(1).max(80))
      .max(30, "No se pueden indicar más de 30 alergias")
      .optional(),
    dietary_restrictions: z
      .array(z.string().trim().min(1).max(80))
      .max(30, "No se pueden indicar más de 30 restricciones")
      .optional()
  })
  .strict();

module.exports = {
  profileBodySchema
};
