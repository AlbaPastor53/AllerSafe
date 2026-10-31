export type CatalogStatus = 'active' | 'inactive';

export type EventCategory = 'alergias' | 'cocina' | 'reposteria' | 'nutricion' | 'seguridad';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: CatalogStatus;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  status?: CatalogStatus;
  is_active?: boolean;
}

export const CATEGORY_LABELS: Record<string, string> = {
  alergias: 'Alergias',
  cocina: 'Cocina',
  reposteria: 'Repostería',
  nutricion: 'Nutrición',
  seguridad: 'Seguridad alimentaria'
};
