import { Category } from './category.model';
import { EventImage } from './event-image.model';
import { Host } from './host.model';
import { Location } from './location.model';

export type EventStatus = 'draft' | 'published';

export interface Event {
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

export interface EventSummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: EventStatus;
  is_active: boolean;
  categories?: Category[];
  location?: Location | string;
  date?: string;
  time?: string;
  price?: number;
  capacity?: number;
}

export interface EventPayload {
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

export interface EventFilters {
  category?: string;
  status?: 'active' | 'inactive' | 'all';
  eventStatus?: EventStatus | 'all';
  includeDeleted?: boolean;
}

export type EventSort =
  | 'date_asc'
  | 'date_desc'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc';

export interface EventSearchFilters {
  search?: string;
  category?: string[];
  host?: string[];
  location?: string[];
  status?: EventStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: EventSort;
}

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

export function eventCoverImage(event: Event): EventImage | null {
  const images = event.images ?? [];
  return images.find((image) => image.isCover) ?? images[0] ?? null;
}

export function eventHostName(event: Event): string {
  const host = event.host;
  if (!host) return 'Sin anfitrión';
  if (typeof host === 'string') return host;

  const user = host.user_id;
  if (!user) return 'Sin anfitrión';
  if (typeof user === 'string') return user;

  return user.name?.trim() || 'Sin anfitrión';
}

export function eventLocationName(event: Event): string {
  const location = event.location;
  if (!location) return 'Ubicación por confirmar';
  return typeof location === 'string' ? location : location.name;
}
