'use client';

import { useAtomValue } from 'jotai/react';
import { AlertCircle, CircleX, Edit, RefreshCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchCollections } from '@/hooks/useFetchCollections';
import {
  collectionsErrorAtom,
  collectionsLoadingAtom,
  sortedCollectionsAtom,
  userNamesAtom,
} from '@/lib/atoms';
import { Collection } from '@/types';
import BidsTable from './bids-table';
import { collectionColumnDefinition } from './collection-column-definition';

export default function CollectionsTable() {
  const userNames = useAtomValue(userNamesAtom);
  const collections = useAtomValue(sortedCollectionsAtom);
  const loading = useAtomValue(collectionsLoadingAtom);
  const error = useAtomValue(collectionsErrorAtom);
  const fetchCollections = useFetchCollections();
  const router = useRouter();
  const [expandedCollectionId, setExpandedCollectionId] = useState<number | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<number | null>(null);

  const handleRowClick = (id: number) => {
    setExpandedCollectionId(expandedCollectionId === id ? null : id);
  };

  const handleEditCollection = (id: number) => {
    setCollectionToEdit(id);
    setShowEditDialog(true);
  };

  const handleDeleteCollection = (id: number) => {
    setCollectionToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return;

    try {
      const response = await fetch(`/api/collections/${collectionToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCollections();
        setShowDeleteDialog(false);
        setCollectionToDelete(null);
      } else {
        console.error('Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  return (
    <Card className="max-w-[95vw]">
      <CardHeader>
        <CardTitle>Collections</CardTitle>
        <CardDescription>Manage your collections and view their bids.</CardDescription>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCollections()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="max-w-full overflow-x-hidden px-2 sm:px-6">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6 w-full max-w-[90vw] overflow-hidden">
            <>
              <DataTable
                columns={collectionColumnDefinition}
                data={collections as Collection[]}
                filterColumn="name"
                filterPlaceholder="Filter by collection name..."
                meta={{
                  userNames,
                  fetchCollections,
                  onRowClick: handleRowClick,
                  onEditCollection: handleEditCollection,
                  onDeleteCollection: handleDeleteCollection,
                  expandedCollectionId,
                  expandedRowContent: expandedCollectionId ? (
                    <BidsTable
                      collection={
                        collections.find((c) => c.id === expandedCollectionId) as Collection
                      }
                    />
                  ) : null,
                }}
              />
            </>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
