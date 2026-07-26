import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse, UpdateUserInput, User } from '@orbit/shared';
import { useAuth } from '@clerk/clerk-react';
import { apiClient } from '@/lib/api-client';

export function useUserProfile() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<ApiResponse<User>>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const token = await getToken();
      return apiClient<ApiResponse<User>>('/api/v1/users/me', {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    enabled: !!isSignedIn,
  });
}

export function useUpdateUserProfile() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<User>, Error, UpdateUserInput>({
    mutationFn: async (data: UpdateUserInput) => {
      const token = await getToken();
      return apiClient<ApiResponse<User>>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
