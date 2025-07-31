'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useArtifacts } from '@/hooks/api/useArtifacts';
import { ArtifactCard } from '@/components/artifact-card';
import { useDebounce } from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';

export function SearchWithQuery() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { 
    data, 
    isLoading, 
    isFetching,
    error 
  } = useArtifacts({
    search: debouncedSearch,
    limit: 12
  });

  const hasResults = data?.artifacts && data.artifacts.length > 0;
  const showNoResults = !isLoading && debouncedSearch && !hasResults;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{t.searchArtifacts}</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={() => setSearchTerm('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {isFetching && (
            <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{t.searchError}</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[4/3] rounded-lg mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {hasResults && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {t.showingResults}: {data.artifacts.length} / {data.total}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.artifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        </>
      )}

      {showNoResults && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2 text-4xl">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noResults}</h3>
          <p className="text-gray-600">{t.tryDifferentKeywords}</p>
        </div>
      )}
    </div>
  );
}