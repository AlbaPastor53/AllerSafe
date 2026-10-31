export interface Profile {
  _id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string | null;
  address?: string;
  city?: string;
  postal_code?: string;
  avatar_url?: string;
  bio?: string;
  allergies?: string[];
  dietary_restrictions?: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  avatar_url?: string;
  bio?: string;
  allergies?: string[];
  dietary_restrictions?: string[];
}
