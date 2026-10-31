import { ProfilePayload } from './profile.model';

export type UserRole = 'Admin' | 'Client';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  is_active: boolean;
}

export interface User extends UserSummary {
  slug: string;
  host_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface UserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  slug?: string;
  status?: UserStatus;
  is_active?: boolean;
  profile?: ProfilePayload;
}

export type UpdateUserPayload = Partial<UserPayload>;
