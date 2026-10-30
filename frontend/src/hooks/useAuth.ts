import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export interface AdminUser {
  id: number;
  phone: string;
  email: string | null;
  role: 'admin';
  first_name?: string;
  last_name?: string;
  admin2Fa?: boolean;
}

export function useAuth() {
  const token = localStorage.getItem('token');
  const is2Fa = localStorage.getItem('admin_2fa_verified') === 'true';

  return useQuery({
    queryKey: ['admin', 'auth', 'session'],
    queryFn: async () => {
      const storedUser = localStorage.getItem('user');
      let fallbackUser: Partial<AdminUser> = {};
      try {
        if (storedUser) fallbackUser = JSON.parse(storedUser);
      } catch (e) {
        // ignore
      }

      try {
        const res = await api.get('/admin/auth/session');
        if (res.data?.valid && res.data?.user) {
          return {
            ...fallbackUser,
            ...res.data.user,
            admin2Fa: true,
          } as AdminUser;
        }
      } catch (e) {
        // If offline or endpoint check fails but valid token exists
        if (fallbackUser?.id && fallbackUser?.role === 'admin' && is2Fa) {
          return fallbackUser as AdminUser;
        }
      }
      return null;
    },
    enabled: !!token && is2Fa,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_2fa_verified');
    queryClient.clear();
    navigate('/secret-admin-portal');
  };
}
