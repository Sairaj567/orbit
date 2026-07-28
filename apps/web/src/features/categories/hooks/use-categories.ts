import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesClient } from '../api/categories.client';
import { toast } from 'sonner';
import type { CreateCategoryInput, UpdateCategoryInput } from '@orbit/shared';

export const categoryKeys = {
  all: (workspaceId: string) => ['categories', workspaceId] as const,
};

export function useCategories(workspaceId: string) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.all(workspaceId),
    queryFn: () => categoriesClient.getCategories(workspaceId),
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesClient.createCategory(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all(workspaceId) });
      toast.success('Category created');
    },
    onError: () => {
      toast.error('Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ categoryId, input }: { categoryId: string; input: UpdateCategoryInput }) =>
      categoriesClient.updateCategory(workspaceId, categoryId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all(workspaceId) });
      toast.success('Category updated');
    },
    onError: () => {
      toast.error('Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => categoriesClient.deleteCategory(workspaceId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all(workspaceId) });
      toast.success('Category deleted');
    },
    onError: () => {
      toast.error('Failed to delete category');
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    createCategory: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
