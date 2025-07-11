import { BidService } from '@/lib/db-service';
import { Bid, NewBid } from '@/types';

export async function getBids(): Promise<Bid[]> {
  return await BidService.findAll();
}

export async function getBidById(bidId: number): Promise<Bid | null> {
  return await BidService.findById(bidId);
}

export async function getBidsByCollectionId(collectionId: number): Promise<Bid[]> {
  return await BidService.findByCollectionId(collectionId);
}

export async function createBid(bidData: Omit<NewBid, 'id'>): Promise<Bid> {
  return await BidService.create(bidData);
}

export async function updateBid(
  bidId: number,
  updatedData: Partial<Omit<NewBid, 'id'>>,
): Promise<Bid> {
  return await BidService.update(bidId, updatedData);
}

export async function updateBidStatus(
  bidId: number,
  status: Bid['status'],
  collectionId: number,
): Promise<void> {
  if (status === 'accepted') {
    // Use the service method that handles accepting a bid and rejecting others
    await BidService.acceptBid(bidId, collectionId);
  } else {
    // For other status updates, use the regular update method
    await BidService.updateStatus(bidId, status);
  }
}

export async function deleteBid(bidId: number): Promise<void> {
  await BidService.delete(bidId);
}

// Get bids with detailed user and collection information
export async function getBidsWithDetails(collectionId: number) {
  return await BidService.findByCollectionIdWithDetails(collectionId);
}
