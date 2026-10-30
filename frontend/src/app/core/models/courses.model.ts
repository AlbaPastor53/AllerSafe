export type EventCategory = 'alergias' | 'cocina' | 'reposteria' | 'nutricion' | 'seguridad';
export type EventStatus = 'draft' | 'published';
export type UserRole = 'Admin' | 'Client';
export type UserStatus = 'active' | 'inactive' | 'blocked';
export type HostStatus = 'active' | 'inactive' | 'suspended';
export type CatalogStatus = 'active' | 'inactive';

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  is_active: boolean;
}

export interface Host {
  _id: string;
  user_id: UserSummary | string;
  biography?: string;
  slug: string;
  status: HostStatus;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

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

export interface Courses {
  _id: string;
  name: string;
  slug: string;
  description: string;
  host?: Host | string;
  categories: Category[];
  location?: Location | string;
  classNumber: number;
  date: string;
  time: string;
  price: number;
  capacity: number;
  status: EventStatus;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  images?: EventImage[];
}

export interface CoursesPayload {
  name: string;
  description: string;
  host: string;
  categories: string[];
  location: string;
  classNumber: number;
  date: string;
  time: string;
  price: number;
  capacity: number;
  slug?: string;
  status?: EventStatus;
  is_active?: boolean;
}

export interface RouteFilters {
  category?: string;
  status?: 'active' | 'inactive' | 'all';
  eventStatus?: EventStatus | 'all';
  includeDeleted?: boolean;
}

export const CATEGORY_LABELS: Record<string, string> = {
  alergias: 'Alergias',
  cocina: 'Cocina',
  reposteria: 'Repostería',
  nutricion: 'Nutrición',
  seguridad: 'Seguridad alimentaria'
};

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado'
};

export function refId(value: { _id: string } | string | null | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value._id;
}

export function categoryNames(categories: Category[] | undefined): string {
  if (!categories || categories.length === 0) return 'Sin categoría';
  return categories.map((category) => category.name).join(', ');
}
