import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import type { User, LoginInput, RegisterInput, ApiResponse } from '@orbit/shared';

export function useAuth() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<ApiResponse<User>>({
    queryKey: ['auth', 'session'],
    queryFn: () => apiClient<ApiResponse<User>>('/api/v1/auth/session'),
    retry: false, // Don't retry if not logged in
  });

  const user = sessionQuery.data?.data;
  const isSignedIn = !!user;
  const isLoaded = !sessionQuery.isPending;

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) =>
      apiClient<ApiResponse<void>>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) =>
      apiClient<ApiResponse<void>>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiClient<ApiResponse<void>>('/api/v1/auth/logout', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user,
    isSignedIn,
    isLoaded,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}

export function useUser() {
  const { user, isLoaded, isSignedIn } = useAuth();
  return { user, isLoaded, isSignedIn };
}
