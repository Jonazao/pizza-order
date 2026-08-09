import { apiFetch } from './client';

export type UserRole = 'Customer' | 'Employee';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.accessToken);
  }
  
  return data;
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.accessToken);
  }
  
  return data;
}

export async function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/profile');
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore network error on logout
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
}
