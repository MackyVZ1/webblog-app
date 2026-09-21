export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  articleCount?: number;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverImageAlt?: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  readingTime: number;
  views: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  author: Author;
  categoryId: string;
  authorId: string;
}

export interface ArticleList {
  items: Article[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function serverApiUrl() {
  const runtimeEnv = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env;
  return runtimeEnv?.INTERNAL_API_URL || import.meta.env.INTERNAL_API_URL || import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';
}

export function publicApiUrl() {
  return import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';
}

export async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${serverApiUrl()}/api${path}`);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}
