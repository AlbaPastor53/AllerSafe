export type CatalogStatus = 'active' | 'inactive';

export type EventCategory = 'gluten' | 'lactosa' | 'pescado' | 'frutos-secos' | 'veganos' | 'diabeticos' | 'alimentacion-infantil';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
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
  image_url?: string;
  status?: CatalogStatus;
  is_active?: boolean;
}

export const CATEGORY_LABELS: Record<string, string> = {
  gluten: 'Sin gluten',
  lactosa: 'Sin lactosa',
  pescado: 'Alergia al pescado',
  'frutos-secos': 'Alergia a frutos secos',
  veganos: 'Cocina vegana',
  diabeticos: 'Cocina para diabéticos',
  'alimentacion-infantil': 'Alimentación infantil'
};
