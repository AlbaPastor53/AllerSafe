import { UserRole, UserStatus } from './user.model';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  is_active: boolean;
  slug?: string;
  host_id?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginData {
  user: AuthUser;
}

export interface LoginResponse {
  success?: boolean;
  data: LoginData;
}

export interface AuthMeResponse {
  success?: boolean;
  data: {
    user: AuthUser;
  };
}
