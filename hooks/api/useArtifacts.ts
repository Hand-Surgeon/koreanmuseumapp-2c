import { useQuery, useSuspenseQuery, useInfiniteQuery } from '@tanstack/react-query';
import { artifacts as artifactsData } from '@/data/artifacts';
import { Artifact } from '@/types/artifact';

// API functions (in a real app, these would make HTTP requests)
async function fetchArtifacts({ 
  hall, 
  category, 
  search,
  page = 1,
  limit = 20 
}: {
  hall?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let filtered = artifactsData;
  
  if (hall) {
    filtered = filtered.filter(a => a.hall === hall);
  }
  
  if (category) {
    filtered = filtered.filter(a => a.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(a => 
      Object.values(a.name).some(name => 
        name.toLowerCase().includes(searchLower)
      ) ||
      Object.values(a.description).some(desc => 
        desc.toLowerCase().includes(searchLower)
      )
    );
  }
  
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    artifacts: filtered.slice(start, end),
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit)
  };
}

async function fetchArtifact(id: number): Promise<Artifact | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return artifactsData.find(a => a.id === id) || null;
}

// Query keys factory
export const artifactKeys = {
  all: ['artifacts'] as const,
  lists: () => [...artifactKeys.all, 'list'] as const,
  list: (filters: { hall?: string; category?: string; search?: string }) => 
    [...artifactKeys.lists(), filters] as const,
  details: () => [...artifactKeys.all, 'detail'] as const,
  detail: (id: number) => [...artifactKeys.details(), id] as const,
};

// Hooks
export function useArtifacts(filters: {
  hall?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: artifactKeys.list(filters),
    queryFn: () => fetchArtifacts(filters),
  });
}

export function useArtifact(id: number) {
  return useQuery({
    queryKey: artifactKeys.detail(id),
    queryFn: () => fetchArtifact(id),
    enabled: !!id,
  });
}

// Suspense version for RSC
export function useArtifactSuspense(id: number) {
  return useSuspenseQuery({
    queryKey: artifactKeys.detail(id),
    queryFn: () => fetchArtifact(id),
  });
}

// Infinite scroll version
export function useInfiniteArtifacts(filters: {
  hall?: string;
  category?: string;
  search?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: artifactKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => 
      fetchArtifacts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// Prefetch utilities
export async function prefetchArtifact(queryClient: any, id: number) {
  await queryClient.prefetchQuery({
    queryKey: artifactKeys.detail(id),
    queryFn: () => fetchArtifact(id),
  });
}

export async function prefetchArtifacts(
  queryClient: any,
  filters: { hall?: string; category?: string }
) {
  await queryClient.prefetchQuery({
    queryKey: artifactKeys.list(filters),
    queryFn: () => fetchArtifacts(filters),
  });
}