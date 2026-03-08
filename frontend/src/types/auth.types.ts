export interface UserPayload {
  id: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserPayload;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
