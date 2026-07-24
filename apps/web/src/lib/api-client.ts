import { env } from '@/config/env';

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | string[] | number[] | undefined>;
}

function buildUrl(pathname: string, params?: ApiRequestOptions['params']): string {
  const url = new URL(pathname, env.apiUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }
  }

  return url.toString();
}

export async function apiClient<T>(pathname: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(pathname, options.params), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}