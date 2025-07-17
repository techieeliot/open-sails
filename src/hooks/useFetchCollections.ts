import { compareAsc, parseISO } from 'date-fns';
import { useSetAtom } from 'jotai/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import error from '@/app/dashboard/error';
import { collectionsAtom, collectionsErrorAtom, collectionsLoadingAtom } from '@/lib/atoms';
import { API_ENDPOINTS } from '@/lib/constants';
import { getErrorMessage, safeStringify } from '@/lib/utils';
import { Collection } from '@/types';

/**
 * Custom hook for fetching and managing collections data
 *
 * Features:
 * - Atomic state updates with Jotai
 * - Stable callback reference for fetchCollections
 * - Loading and error state management
 * - Automatic data sorting
 *
 * @returns {Object} Object containing the fetchCollections function
 */
export function useFetchCollections() {
  const setCollections = useSetAtom(collectionsAtom);
  const setError = useSetAtom(collectionsErrorAtom);
  const setLoading = useSetAtom(collectionsLoadingAtom);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  // Stable fetchCollections function with memoization
  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching collections from API...');
      const response = await fetch(API_ENDPOINTS.collections);

      console.log('Collections response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Collections API error response:', errorText);
        throw new Error(`Failed to fetch collections: ${response.status} - ${errorText}`);
      }

      const collectionData: Collection[] = await response.json();
      console.log('Received collection data:', collectionData.length, 'collections');

      if (Array.isArray(collectionData)) {
        setCollections(collectionData);
      } else {
        throw new Error('Received invalid data format for collections');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching collections:', errorMessage);
      setError(errorMessage);
      setCollections([]);
    } finally {
      setLoading(false);
      setLastFetchTime(Date.now());
    }
  }, [setCollections, setError, setLoading]);

  // Track last fetch timestamp for potential cache invalidation or debouncing
  useEffect(() => {
    // This effect could be used to implement auto-refresh functionality
    // or to track when data was last fetched
  }, [lastFetchTime]);

  return fetchCollections;
}
