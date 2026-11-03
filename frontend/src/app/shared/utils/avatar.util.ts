/**
 * Genera una URL determinista de Robohash con el set de gatos (set=set4).
 * El mismo nombre produce siempre el mismo avatar.
 */
export function buildRobohashUrl(seed: string): string {
  const value = seed.trim().toLowerCase() || 'allersafe';
  return `https://robohash.org/${encodeURIComponent(value)}?set=set4&size=160x160`;
}
