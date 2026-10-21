export type EventCategory = 'alergias' | 'cocina' | 'reposteria' | 'nutricion' | 'seguridad';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export interface TrailRoute {
  _id: string; name: string; slug: string; description: string; date: string;
  price: number; category: EventCategory; capacity: number; isActive: boolean;
  status: EventStatus; created_at?: string; updated_at?: string; deleted_at?: string | null;
}
export interface TrailRoutePayload {
  name: string; description: string; date: string; price: number;
  category: EventCategory; capacity: number; slug?: string; isActive?: boolean; status?: EventStatus;
}
export interface RouteFilters { category?: EventCategory; status?: 'active' | 'inactive' | 'all'; eventStatus?: EventStatus | 'all'; includeDeleted?: boolean; }
export const CATEGORY_LABELS: Record<EventCategory,string> = {
  alergias: 'Alergias', cocina: 'Cocina', reposteria: 'Repostería', nutricion: 'Nutrición', seguridad: 'Seguridad alimentaria'
};
export const STATUS_LABELS: Record<EventStatus,string> = { draft: 'Borrador', published: 'Publicado', cancelled: 'Cancelado', completed: 'Completado' };
