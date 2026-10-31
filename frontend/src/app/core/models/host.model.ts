import { UserSummary } from './user.model';

export type HostStatus = 'active' | 'inactive' | 'suspended';

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

export interface HostPayload {
  user_id: string;
  biography?: string;
  slug?: string;
  status?: HostStatus;
  is_active?: boolean;
}
