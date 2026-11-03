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
