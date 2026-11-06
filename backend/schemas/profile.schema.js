const { z } = require("zod");

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MAX_AVATAR_LENGTH = 3000000;
const DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function isExternalUrl(value) {
  if (!/^https?:\/\//i.test(value) || value.length > 500) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isImageDataUrl(value) {
  const match = DATA_URL_RE.exec(value);
  if (!match) return false;

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_AVATAR_BYTES) return false;

  if (match[1] === "jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (match[1] === "png") {
    return buffer.subarray(0, 8).equals(PNG_SIGNATURE);
  }

  return (
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP"
  );
}

function isValidAvatar(value) {
  return value === "" || isExternalUrl(value) || isImageDataUrl(value);
}

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
    avatar_url: z
      .string()
      .trim()
      .max(MAX_AVATAR_LENGTH, "El avatar es demasiado grande")
      .refine(isValidAvatar, "La URL del avatar no es válida")
      .optional(),
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
