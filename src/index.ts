import { ponder } from "@/generated";

// ==========================================
// FACTORY HANDLERS
// ==========================================
ponder.on("LaunchpadFactory:CollectionLaunched", async ({ event, context }) => {
  const { Collection } = context.db;
  
  await Collection.create({
    id: event.args.collectionAddress.toLowerCase(),
    data: {
      owner: event.args.owner.toLowerCase(),
      name: event.args.name,
      symbol: event.args.symbol,
      launchedAt: event.block.timestamp,
    },
  });
});

// ==========================================
// NFT COLLECTION HANDLERS
// ==========================================
ponder.on("BasedRickLaunchpad:Transfer", async ({ event, context }) => {
  const { Token, TransferEvent } = context.db;
  const collectionAddress = event.log.address.toLowerCase();
  const tokenId = event.args.tokenId;
  const id = `${collectionAddress}-${tokenId.toString()}`;

  // 1. Update the current owner of the NFT
  await Token.upsert({
    id,
    create: {
      collectionAddress,
      tokenId,
      owner: event.args.to.toLowerCase(),
    },
    update: {
      owner: event.args.to.toLowerCase(),
    },
  });

  // 2. Log the transfer for historical activity feeds
  await TransferEvent.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      collectionAddress,
      tokenId,
      from: event.args.from.toLowerCase(),
      to: event.args.to.toLowerCase(),
      timestamp: event.block.timestamp,
    },
  });
});

ponder.on("BasedRickLaunchpad:OwnershipTransferred", async ({ event, context }) => {
  const { CollectionOwnership } = context.db;
  
  await CollectionOwnership.upsert({
    id: event.log.address.toLowerCase(),
    create: { owner: event.args.newOwner.toLowerCase() },
    update: { owner: event.args.newOwner.toLowerCase() },
  });
});

// ==========================================
// MARKETPLACE HANDLERS
// ==========================================
ponder.on("BasedRickMarketplace:ListingCreated", async ({ event, context }) => {
  const { Listing } = context.db;
  const collectionAddress = event.args.nftAddress.toLowerCase();
  
  await Listing.upsert({
    id: `${collectionAddress}-${event.args.tokenId.toString()}`,
    create: {
      collectionAddress,
      tokenId: event.args.tokenId,
      seller: event.args.seller.toLowerCase(),
      price: event.args.price,
      expiresAt: event.args.expiresAt,
      isActive: true,
    },
    update: {
      seller: event.args.seller.toLowerCase(),
      price: event.args.price,
      expiresAt: event.args.expiresAt,
      isActive: true,
    },
  });
});

ponder.on("BasedRickMarketplace:ListingUpdated", async ({ event, context }) => {
  const { Listing } = context.db;
  await Listing.update({
    id: `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId.toString()}`,
    data: { price: event.args.newPrice, expiresAt: event.args.newExpiresAt },
  });
});

ponder.on("BasedRickMarketplace:ListingCanceled", async ({ event, context }) => {
  const { Listing } = context.db;
  await Listing.update({
    id: `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId.toString()}`,
    data: { isActive: false },
  });
});

ponder.on("BasedRickMarketplace:ListingPurchased", async ({ event, context }) => {
  const { Listing, Sale } = context.db;
  const collectionAddress = event.args.nftAddress.toLowerCase();
  
  // Mark listing as sold/inactive
  await Listing.update({
    id: `${collectionAddress}-${event.args.tokenId.toString()}`,
    data: { isActive: false },
  });

  // Record historical sale
  await Sale.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      collectionAddress,
      tokenId: event.args.tokenId,
      buyer: event.args.buyer.toLowerCase(),
      seller: event.args.seller.toLowerCase(),
      price: event.args.price,
      timestamp: event.block.timestamp,
    },
  });
});

ponder.on("BasedRickMarketplace:OfferMade", async ({ event, context }) => {
  const { Offer } = context.db;
  const collectionAddress = event.args.nftAddress.toLowerCase();
  const bidder = event.args.bidder.toLowerCase();
  
  await Offer.upsert({
    id: `${collectionAddress}-${event.args.tokenId.toString()}-${bidder}`,
    create: {
      collectionAddress,
      tokenId: event.args.tokenId,
      bidder,
      amount: event.args.amount,
      expiresAt: event.args.expiresAt,
      isActive: true,
    },
    update: { amount: event.args.amount, expiresAt: event.args.expiresAt, isActive: true },
  });
});

ponder.on("BasedRickMarketplace:OfferCanceled", async ({ event, context }) => {
  const { Offer } = context.db;
  await Offer.update({
    id: `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId.toString()}-${event.args.bidder.toLowerCase()}`,
    data: { isActive: false },
  });
});

ponder.on("BasedRickMarketplace:OfferAccepted", async ({ event, context }) => {
  const { Offer, Listing, Sale } = context.db;
  const collectionAddress = event.args.nftAddress.toLowerCase();
  
  // Consume offer
  await Offer.update({
    id: `${collectionAddress}-${event.args.tokenId.toString()}-${event.args.buyer.toLowerCase()}`,
    data: { isActive: false },
  });

  // Invalidate any active listing
  await Listing.update({
    id: `${collectionAddress}-${event.args.tokenId.toString()}`,
    data: { isActive: false },
  }).catch(() => {});

  // Record historical sale
  await Sale.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      collectionAddress,
      tokenId: event.args.tokenId,
      buyer: event.args.buyer.toLowerCase(),
      seller: event.args.seller.toLowerCase(),
      price: event.args.price,
      timestamp: event.block.timestamp,
    },
  });
});