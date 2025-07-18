'use client';

import { useAtomValue } from 'jotai/react';
import { AlertCircle, Archive, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { DataTable } from '@/components/data-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchCollections } from '@/hooks/useFetchCollections';
import {
  collectionsErrorAtom,
  collectionsLoadingAtom,
  sortedCollectionsAtom,
  userLoginStatusAtom,
  userNamesAtom,
} from '@/lib/atoms';
import type { Collection } from '@/types';

import BidsTable from './bids-table';
import { collectionColumnDefinition } from './collection-column-definition';
import CreateCollectionDialog from '@/components/create-collection-dialog';

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
  const isLoggedIn = useAtomValue(userLoginStatusAtom);

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
    <Card className="max-w-[95vw] shadow-xl border-0 bg-zinc-900 text-white">
      <CardHeader className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-1 grid-cols-1 items-center justify-between md:flex-row md:gap-0 md:items-end w-full">
          <div className="flex gap-3 grid-cols-1 items-center w-full">
            <div className="w-full">
              <CardTitle className="flex gap-3 grid-cols-1 items-center">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Archive
                    className="h-5 w-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </div>
                <h1 className="text-2xl font-bold">All Collections</h1>
              </CardTitle>
              <CardDescription className="text-zinc-400 text-sm sm:text-base mt-1 mb-4 md:mb-0">
                Manage your collections and view their bids.
              </CardDescription>
              <div className="flex flex-col gap-3 w-full md:hidden">
                {!loading && isLoggedIn && <CreateCollectionDialog onSuccess={fetchCollections} />}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCollections()}
                  className="flex items-center gap-2 bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-500 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          <div className="mb-2 hidden w-full flex-col items-center md:items-end justify-between md:justify-end gap-4 md:flex-row md:mb-0 md:flex">
            {!loading && isLoggedIn && <CreateCollectionDialog onSuccess={fetchCollections} />}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCollections()}
              className="flex items-center gap-2 bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-500 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-w-full overflow-x-hidden px-4 sm:px-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full bg-zinc-800 rounded-lg" />
            <Skeleton className="h-12 w-full bg-zinc-800 rounded-lg" />
            <Skeleton className="h-12 w-full bg-zinc-800 rounded-lg" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="bg-red-950/50 border-red-800 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-red-200">Error</AlertTitle>
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="w-full max-w-[90vw] space-y-6 overflow-hidden">
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

              {/* Edit Collection Dialog */}
              {showEditDialog && collectionToEdit && (
                <DynamicInputDialog
                  key={`edit-collection-${collectionToEdit}`}
                  triggerText="Edit"
                  dialogTitle="Edit Collection"
                  dialogDescription="Update your collection details."
                  modalCategory="collection"
                  method="PUT"
                  collectionId={collectionToEdit}
                  onSuccess={() => {
                    setShowEditDialog(false);
                    setCollectionToEdit(null);
                  }}
                  open={showEditDialog}
                  onOpenChange={(open) => {
                    if (!open) {
                      setShowEditDialog(false);
                      setCollectionToEdit(null);
                    }
                  }}
                />
              )}

              {/* Delete Collection Confirmation */}
              <ConfirmationDialog
                key={`delete-collection-${collectionToDelete}`}
                triggerText="Delete"
                title="Delete Collection"
                dialogDescription="Are you sure you want to delete this collection? This action cannot be undone."
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={confirmDeleteCollection}
              />
            </>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
