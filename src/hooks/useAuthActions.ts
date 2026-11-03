import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useAuthStore, getStoredRefreshToken } from '@/stores/authStore';
import type { LoginPayload, RegisterPayload } from '@shopsphere/api-client';

/**
 * The backend merges the guest cart into the new session automatically on
 * register/login (it reads the same `X-Guest-Token` this request sent) —
 * the client's only job afterward is to invalidate the cached cart so the
 * merged result is refetched rather than showing the stale pre-merge cart.
 */
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => api.auth.register(payload),
    onSuccess: async (result) => {
      await useAuthStore.getState().setSession(result);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => api.auth.login(payload),
    onSuccess: async (result) => {
      await useAuthStore.getState().setSession(result);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refreshToken = await getStoredRefreshToken();
      // Best-effort: even if the network call fails (e.g. offline), the local session still clears below.
      if (refreshToken) await api.auth.logout(refreshToken).catch(() => undefined);
    },
    onSettled: async () => {
      await useAuthStore.getState().clearSession();
      queryClient.clear();
    }
  });
}
