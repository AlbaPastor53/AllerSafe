/**
 * Devuelve el nombre completo del perfil (nombre + apellidos) o null si no
 * tiene ninguno de los dos. Se usa para generar las iniciales del avatar.
 */
export function buildProfileName(
  profile: { first_name?: string; last_name?: string } | null | undefined
): string | null {
  if (!profile) return null;

  const name = [profile.first_name, profile.last_name]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0)
    .join(' ');

  return name || null;
}
