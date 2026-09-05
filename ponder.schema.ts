import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Token: p.createTable({
    id: p.string(), // Format: collectionAddress-tokenId
    collectionAddress: p.string(),
    tokenId: p.bigint(),
    owner: p.string(),
  }),
  TransferEvent: p.createTable({
    id: p.string(), // Format: transactionHash-logIndex
    collectionAddress: p.string(),
    tokenId: p.bigint(),
    from: p.string(),
    to: p.string(),
    timestamp: p.bigint(),
  }),
  CollectionOwnership: p.createTable({
    id: p.string(), // Format: collectionAddress
    owner: p.string(),
  }),
  Listing: p.createTable({
    id: p.string(), // Format: nftAddress-tokenId
    collectionAddress: p.string(),
    tokenId: p.bigint(),
    seller: p.string(),
    price: p.bigint(),
    expiresAt: p.bigint(),
    isActive: p.boolean(),
  }),
  Sale: p.createTable({
    id: p.string(), // Format: txHash-logIndex
    collectionAddress: p.string(),
    tokenId: p.bigint(),
    buyer: p.string(),
    seller: p.string(),
    price: p.bigint(),
    timestamp: p.bigint(),
  }),
  Offer: p.createTable({
    id: p.string(), // Format: nftAddress-tokenId-bidder
    collectionAddress: p.string(),
    tokenId: p.bigint(),
    bidder: p.string(),
    amount: p.bigint(),
    expiresAt: p.bigint(),
    isActive: p.boolean(),
  }),
  Collection: p.createTable({
    id: p.string(), // Format: collectionAddress
    owner: p.string(),
    name: p.string(),
    symbol: p.string(),
    launchedAt: p.bigint(),
  }),
}));