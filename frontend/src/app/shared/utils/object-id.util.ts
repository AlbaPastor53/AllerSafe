const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export function isValidObjectId(value: string): boolean {
  return OBJECT_ID_PATTERN.test(value.trim());
}
