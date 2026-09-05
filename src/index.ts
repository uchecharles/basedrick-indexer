import { ponder } from "ponder:registry";
import { collection, sale, listing, offer } from "ponder:schema";

// ==========================================
// 1. FACTORY EVENTS
// ==========================================
ponder.on("LaunchpadFactory:CollectionLaunched", async ({ event, context }) => {
  await context.db.insert(collection).values({
    id: event.args.collectionAddress.toLowerCase(),
    creator: event.args.owner.toLowerCase(),
    name: event.args.name,
    symbol: event.args.symbol,
    launchedAt: Number(event.block.timestamp),
  });
  console.log(`✅ Collection Indexed: ${event.args.name}`);
});


// ==========================================
// 2. LISTING EVENTS
// ==========================================
ponder.on("BasedRickMarketplace:ListingCreated", async ({ event, context }) => {
  const id = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId}`;
  await context.db.insert(listing).values({
    id,
    collectionAddress: event.args.nftAddress.toLowerCase(),
    tokenId: Number(event.args.tokenId),
    seller: event.args.seller.toLowerCase(),
    price: event.args.price,
    expiresAt: Number(event.args.expiresAt),
    isActive: true,
  }).onConflictDoUpdate(() => ({
    seller: event.args.seller.toLowerCase(),
    price: event.args.price,
    expiresAt: Number(event.args.expiresAt),
    isActive: true,
  }));
  console.log(`🏷️ Listing Created: Token #${event.args.tokenId}`);
});

ponder.on("BasedRickMarketplace:ListingUpdated", async ({ event, context }) => {
  const id = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId}`;
  try {
    await context.db.update(listing, { id }).set({
      price: event.args.newPrice,
      expiresAt: Number(event.args.newExpiresAt),
    });
    console.log(`🔄 Listing Updated: Token #${event.args.tokenId}`);
  } catch (error) {}
});

ponder.on("BasedRickMarketplace:ListingCanceled", async ({ event, context }) => {
  const id = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId}`;
  try {
    await context.db.update(listing, { id }).set({ isActive: false });
    console.log(`🚫 Listing Canceled: Token #${event.args.tokenId}`);
  } catch (error) {}
});


// ==========================================
// 3. OFFER EVENTS
// ==========================================
ponder.on("BasedRickMarketplace:OfferMade", async ({ event, context }) => {
  // Bidders can make multiple offers on the same token, so we include bidder in the ID
  const id = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId}-${event.args.bidder.toLowerCase()}`;
  await context.db.insert(offer).values({
    id,
    collectionAddress: event.args.nftAddress.toLowerCase(),
    tokenId: Number(event.args.tokenId),
    bidder: event.args.bidder.toLowerCase(),
    amount: event.args.amount,
    expiresAt: Number(event.args.expiresAt),
    isActive: true,
  }).onConflictDoUpdate(() => ({
    amount: event.args.amount,
    expiresAt: Number(event.args.expiresAt),
    isActive: true,
  }));
  console.log(`👋 Offer Made: Token #${event.args.tokenId}`);
});

ponder.on("BasedRickMarketplace:OfferCanceled", async ({ event, context }) => {
  const id = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId}-${event.args.bidder.toLowerCase()}`;
  try {
    await context.db.update(offer, { id }).set({ isActive: false });
    console.log(`❌ Offer Canceled: Token #${event.args.tokenId}`);
  } catch (error) {}
});


// ==========================================
// 4. SALE EVENTS (Purchases & Accepted Offers)
// ==========================================
ponder.on("BasedRickMarketplace:ListingPurchased", async ({ event, context }) => {
  // 1. Record the Sale
  await context.db.insert(sale).values({
    id: `${event.transaction.hash}-${event.args.tokenId}`, 
    collectionAddress: event.args.nftAddress.toLowerCase(),
    tokenId: Number(event.args.tokenId),
    buyer: event.args.buyer.toLowerCase(),
    seller: event.args.seller.toLowerCase(),
    price: event.args.price,
    timestamp: Number(event.block.timestamp),
    saleType: "Purchase",
  });

  // 2. Mark the listing as Sold (inactive)
  const listingId = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId}`;
  try {
    await context.db.update(listing, { id: listingId }).set({ isActive: false });
  } catch (error) {}

  console.log(`💰 Sale Indexed: Token #${event.args.tokenId}`);
});

ponder.on("BasedRickMarketplace:OfferAccepted", async ({ event, context }) => {
  // 1. Record the Sale
  await context.db.insert(sale).values({
    id: `${event.transaction.hash}-${event.args.tokenId}`, 
    collectionAddress: event.args.nftAddress.toLowerCase(),
    tokenId: Number(event.args.tokenId),
    buyer: event.args.buyer.toLowerCase(),
    seller: event.args.seller.toLowerCase(),
    price: event.args.price,
    timestamp: Number(event.block.timestamp),
    saleType: "OfferAccepted",
  });

  // 2. Mark the accepted offer as inactive
  const offerId = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId}-${event.args.buyer.toLowerCase()}`;
  try {
    await context.db.update(offer, { id: offerId }).set({ isActive: false });
  } catch (error) {}

  // 3. Mark any existing listing for this token as inactive (since ownership transferred)
  const listingId = `${event.args.nftAddress.toLowerCase()}-${event.args.tokenId}`;
  try {
    await context.db.update(listing, { id: listingId }).set({ isActive: false });
  } catch (error) {}

  console.log(`🤝 Offer Accepted Indexed: Token #${event.args.tokenId}`);
});