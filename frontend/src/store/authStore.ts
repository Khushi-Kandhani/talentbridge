import { create } from 'zustand';
export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'HIRING_MANAGER' | 'ADMIN';
type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
};
function decodeUser(token: string): { role: UserRole; email: string; firstName: string; lastName: string } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      role: payload.role,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  } catch {
    return null;
  }
}
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  role: (localStorage.getItem('role') as UserRole) || null,
  email: localStorage.getItem('email'),
  firstName: localStorage.getItem('firstName'),
  lastName: localStorage.getItem('lastName'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  login: (accessToken, refreshToken) => {
    const decoded = decodeUser(accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    if (decoded) {
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('email', decoded.email);
      localStorage.setItem('firstName', decoded.firstName);
      localStorage.setItem('lastName', decoded.lastName);
    }
    set({
      accessToken,
      refreshToken,
      role: decoded?.role || null,
      email: decoded?.email || null,
      firstName: decoded?.firstName || null,
      lastName: decoded?.lastName || null,
      isAuthenticated: true,
    });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    set({
      accessToken: null,
      refreshToken: null,
      role: null,
      email: null,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
    });
  },
}));
