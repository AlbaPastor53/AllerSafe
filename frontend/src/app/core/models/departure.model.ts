import { EventSummary } from './event.model';

export type DepartureStatus = 'scheduled' | 'full' | 'cancelled' | 'completed';

export interface Departure {
  _id: string;
  event: EventSummary | string;
  start_datetime: string;
  end_datetime: string;
  capacity: number;
  price: number;
  booked_participants: number;
  slug: string;
  status: DepartureStatus;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface DeparturePayload {
  event: string;
  start_datetime: string;
  end_datetime: string;
  capacity: number;
  price: number;
  booked_participants?: number;
  slug?: string;
  status?: DepartureStatus;
  is_active?: boolean;
}

export interface DepartureFilters {
  event?: string;
  includeDeleted?: boolean;
}
