import { BIDS_PATH } from '@/lib/constants';
import { Bid } from '@/types';
import { fetchDataByPath, setDataByPath } from '../utils';

export async function getBids(): Promise<Bid[]> {
  return fetchDataByPath(BIDS_PATH);
}

export async function saveBids(bids: Bid[]) {
  return setDataByPath(BIDS_PATH, bids);
}

export async function updateBidStatus(bidId: number, status: Bid['status'], collectionId: number) {
  const bids = await getBids();
  const bidIndex = bids.findIndex((b) => b.id === bidId);

  if (bidIndex === -1) {
    throw new Error('Bid not found');
  }

  bids[bidIndex].status = status;
  bids[bidIndex].updatedAt = new Date().toISOString();

  if (status === 'accepted') {
    for (let i = 0; i < bids.length; i++) {
      if (bids[i].collectionId === collectionId && bids[i].id !== bidId) {
        bids[i].status = 'rejected';
        bids[i].updatedAt = new Date().toISOString();
      }
    }
  }

  await saveBids(bids);
  return bids[bidIndex];
}

export async function createBid(bid: any) {
  const bids = await getBids();
  const newId = bids.length ? Math.max(...bids.map((b) => b.id)) + 1 : 1;
  const newBid: Bid = {
    ...bid,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bids.push(newBid);
  await saveBids(bids);
  return newBid;
}

export async function updateBid(bidId: number, updatedData: Bid) {
  const bids = await getBids();
  const bidIndex = bids.findIndex((b) => b.id === bidId);

  if (bidIndex === -1) {
    throw new Error('Bid not found');
  }

  const updatedBid: Bid = {
    ...bids[bidIndex],
    ...updatedData,
    updatedAt: new Date().toISOString(),
  };

  bids[bidIndex] = updatedBid;
  await saveBids(bids);
  return updatedBid;
}

export async function deleteBid(bidId: number) {
  const bids = await getBids();
  const updatedBids = bids.filter((b) => b.id !== bidId);

  if (updatedBids.length === bids.length) {
    throw new Error('Bid not found');
  }

  await saveBids(updatedBids);
  return { message: 'Bid deleted successfully' };
}

export async function getBidById(bidId: number) {
  const bids = await getBids();
  const bid = bids.find((b) => b.id === bidId);

  if (!bid) {
    throw new Error('Bid not found');
  }

  return bid;
}

export async function getBidsByCollectionId(collectionId: number) {
  const bids = await getBids();
  return bids.filter((b) => b.collectionId === collectionId);
}
