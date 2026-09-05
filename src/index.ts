import { ponder } from "ponder:registry";
import { 
  collection, 
  token, 
  transferEvent, 
  collectionOwnership, 
  listing, 
  sale, 
  offer 
} from "ponder:schema";

// ==========================================
// FACTORY HANDLERS
// ==========================================
ponder.on("LaunchpadFactory:CollectionLaunched", async ({ event, context }) => {
  await context.db.insert(collection).values({
    id: event.args.collectionAddress.toLowerCase(),
    owner: event.args.owner.toLowerCase(),
    name: event.args.name,
    symbol: event.args.symbol,
    launchedAt: event.block.timestamp,
  });
});

// ==========================================
// NFT COLLECTION HANDLERS
// ==========================================
ponder.on("BasedRickLaunchpad:Transfer", async ({ event, context }) => {
  const collectionAddress = event.log.address.toLowerCase();
  const tokenId = event.args.tokenId;
  const id = `${collectionAddress}-${tokenId.toString()}`;

  // 1. Update the current owner of the NFT
  await context.db.insert(token).values({
    id,
    collectionAddress,
    tokenId,
    owner: event.args.to.toLowerCase(),
  }).onConflictDoUpdate({
    owner: event.args.to.toLowerCase(),
  });

  // 2. Log the transfer for historical activity feeds
  await context.db.insert(transferEvent).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    collectionAddress,
    tokenId,
    from: event.args.from.toLowerCase(),
    to: event.args.to.toLowerCase(),
    timestamp: event.block.timestamp,
  });
});

ponder.on("BasedRickLaunchpad:OwnershipTransferred", async ({ event, context }) => {
  await context.db.insert(collectionOwnership).values({
    id: event.log.address.toLowerCase(),
    owner: event.args.newOwner.toLowerCase(),
  }).onConflictDoUpdate({
    owner: event.args.newOwner.toLowerCase(),
  });
});

// ==========================================
// MARKETPLACE HANDLERS
// ==========================================
ponder.on("BasedRickMarketplace:ListingCreated", async ({ event, context }) => {
  const collectionAddress = event.args.nftAddress.toLowerCase();
  
  await context.db.insert(listing).values({
    id: `${collectionAddress}-${event.args.tokenId.toString()}`,
    collectionAddress,
    tokenId: event.args.tokenId,
    seller: event.args.seller.toLowerCase(),
    price: event.args.price,
    expiresAt: event.args.expiresAt,
    isActive: true,
  }).onConflictDoUpdate({
    seller: event.args.seller.toLowerCase(),
    price: event.args.price,
    expiresAt: event.args.expiresAt,
    isActive: true,
  });
});

ponder.on("BasedRickMarketplace:ListingUpdated", async ({ event, context }) => {
  const id = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId.toString()}`;
  
  await context.db.update(listing, { id }).set({
    price: event.args.newPrice,
    expiresAt: event.args.newExpiresAt,
  });
});

ponder.on("BasedRickMarketplace:ListingCanceled", async ({ event, context }) => {
  const id = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId.toString()}`;
  
  await context.db.update(listing, { id }).set({
    isActive: false,
  });
});

ponder.on("BasedRickMarketplace:ListingPurchased", async ({ event, context }) => {
  const collectionAddress = event.args.nftAddress.toLowerCase();
  const id = `${collectionAddress}-${event.args.tokenId.toString()}`;
  
  // Mark listing as sold/inactive
  await context.db.update(listing, { id }).set({
    isActive: false,
  });

  // Record historical sale
  await context.db.insert(sale).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    collectionAddress,
    tokenId: event.args.tokenId,
    buyer: event.args.buyer.toLowerCase(),
    seller: event.args.seller.toLowerCase(),
    price: event.args.price,
    timestamp: event.block.timestamp,
  });
});

ponder.on("BasedRickMarketplace:OfferMade", async ({ event, context }) => {
  const collectionAddress = event.args.nftAddress.toLowerCase();
  const bidder = event.args.bidder.toLowerCase();
  const id = `${collectionAddress}-${event.args.tokenId.toString()}-${bidder}`;
  
  await context.db.insert(offer).values({
    id,
    collectionAddress,
    tokenId: event.args.tokenId,
    bidder,
    amount: event.args.amount,
    expiresAt: event.args.expiresAt,
    isActive: true,
  }).onConflictDoUpdate({
    amount: event.args.amount,
    expiresAt: event.args.expiresAt,
    isActive: true,
  });
});

ponder.on("BasedRickMarketplace:OfferCanceled", async ({ event, context }) => {
  const id = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId.toString()}-${event.args.bidder.toLowerCase()}`;
  
  await context.db.update(offer, { id }).set({
    isActive: false,
  });
});

ponder.on("BasedRickMarketplace:OfferAccepted", async ({ event, context }) => {
  const collectionAddress = event.args.nftAddress.toLowerCase();
  const id = `${collectionAddress}-${event.args.tokenId.toString()}`;
  
  // Consume offer
  await context.db.update(offer, { id: `${id}-${event.args.buyer.toLowerCase()}` }).set({
    isActive: false,
  });

  // Invalidate any active listing (wrap in try/catch in case it doesn't exist)
  try {
    await context.db.update(listing, { id }).set({
      isActive: false,
    });
  } catch (e) {}

  // Record historical sale
  await context.db.insert(sale).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    collectionAddress,
    tokenId: event.args.tokenId,
    buyer: event.args.buyer.toLowerCase(),
    seller: event.args.seller.toLowerCase(),
    price: event.args.price,
    timestamp: event.block.timestamp,
  });
});