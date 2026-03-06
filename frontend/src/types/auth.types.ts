export interface UserPayload {
  id: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
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

export interface RefreshTokenRequest {
  refreshToken: string;
}
