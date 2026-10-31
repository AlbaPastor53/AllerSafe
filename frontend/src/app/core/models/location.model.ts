import { CatalogStatus } from './category.model';

export interface Location {
  _id: string;
  name: string;
  address: string;
  slug: string;
  status: CatalogStatus;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface LocationPayload {
  name: string;
  address: string;
  slug?: string;
  status?: CatalogStatus;
  is_active?: boolean;
}
