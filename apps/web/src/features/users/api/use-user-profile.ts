import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse, UpdateUserInput, User } from '@orbit/shared';
import { apiClient } from '@/lib/api-client';

export function useUserProfile() {
  return useQuery<ApiResponse<User>>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      return apiClient<ApiResponse<User>>('/api/v1/users/me');
    },
    enabled: !!isSignedIn,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<User>, Error, UpdateUserInput>({
    mutationFn: async (data: UpdateUserInput) => {
      return apiClient<ApiResponse<User>>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
