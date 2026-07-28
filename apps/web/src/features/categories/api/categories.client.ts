import { apiClient } from '@/lib/api-client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@orbit/shared';

class CategoriesClient {
  async getCategories(workspaceId: string): Promise<Category[]> {
    return apiClient<Category[]>(`/workspaces/${workspaceId}/categories`, { method: 'GET' });
  }

  async createCategory(workspaceId: string, input: CreateCategoryInput): Promise<Category> {
    return apiClient<Category>(`/workspaces/${workspaceId}/categories`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateCategory(
    workspaceId: string,
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<Category> {
    return apiClient<Category>(`/workspaces/${workspaceId}/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteCategory(workspaceId: string, categoryId: string): Promise<void> {
    return apiClient<void>(`/workspaces/${workspaceId}/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }
}

export const categoriesClient = new CategoriesClient();
