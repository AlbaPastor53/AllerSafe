import { CatalogStatus } from './category.model';

export interface EventImage {
  _id: string;
  event: string;
  url: string;
  alt?: string;
  position: number;
  isCover?: boolean;
  slug?: string;
  status?: CatalogStatus;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface EventImagePayload {
  event: string;
  url: string;
  alt?: string;
  position?: number;
  isCover?: boolean;
  slug?: string;
  status?: CatalogStatus;
  is_active?: boolean;
}
