export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_store_admin: boolean;
  preferred_language: 'en' | 'he';
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginResponse extends TokenPair {
  user: User;
}
