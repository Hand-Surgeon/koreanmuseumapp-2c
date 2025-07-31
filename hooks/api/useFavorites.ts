import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Artifact } from '@/types/artifact';
import { artifacts as artifactsData } from '@/data/artifacts';

// Simulated API functions
async function fetchFavorites(): Promise<number[]> {
  // In a real app, this would fetch from an API
  const stored = typeof window !== 'undefined' 
    ? localStorage.getItem('favorites') 
    : null;
  return stored ? JSON.parse(stored) : [];
}

async function addFavorite(artifactId: number): Promise<void> {
  const favorites = await fetchFavorites();
  if (!favorites.includes(artifactId)) {
    const updated = [...favorites, artifactId];
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(updated));
    }
  }
}

async function removeFavorite(artifactId: number): Promise<void> {
  const favorites = await fetchFavorites();
  const updated = favorites.filter(id => id !== artifactId);
  if (typeof window !== 'undefined') {
    localStorage.setItem('favorites', JSON.stringify(updated));
  }
}

async function fetchFavoriteArtifacts(): Promise<Artifact[]> {
  const favoriteIds = await fetchFavorites();
  return artifactsData.filter(artifact => favoriteIds.includes(artifact.id));
}

// Query keys
export const favoriteKeys = {
  all: ['favorites'] as const,
  list: () => [...favoriteKeys.all, 'list'] as const,
  artifacts: () => [...favoriteKeys.all, 'artifacts'] as const,
};

// Hooks
export function useFavorites() {
  return useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: fetchFavorites,
    staleTime: Infinity, // Favorites don't become stale
  });
}

export function useFavoriteArtifacts() {
  return useQuery({
    queryKey: favoriteKeys.artifacts(),
    queryFn: fetchFavoriteArtifacts,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ artifactId, isFavorite }: { 
      artifactId: number; 
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        await removeFavorite(artifactId);
      } else {
        await addFavorite(artifactId);
      }
    },
    onMutate: async ({ artifactId, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });

      // Snapshot previous values
      const previousFavorites = queryClient.getQueryData(favoriteKeys.list());

      // Optimistically update
      queryClient.setQueryData(favoriteKeys.list(), (old: number[] = []) => {
        if (isFavorite) {
          return old.filter(id => id !== artifactId);
        } else {
          return [...old, artifactId];
        }
      });

      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoriteKeys.list(), context.previousFavorites);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}

// Helper hook to check if an artifact is favorited
export function useIsFavorite(artifactId: number) {
  const { data: favorites = [] } = useFavorites();
  return favorites.includes(artifactId);
}