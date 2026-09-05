import { onchainTable } from "ponder";

export const token = onchainTable("token", (t) => ({
  id: t.text().primaryKey(), // Format: collectionAddress-tokenId
  collectionAddress: t.text().notNull(),
  tokenId: t.bigint().notNull(),
  owner: t.text().notNull(),
}));

export const transferEvent = onchainTable("transfer_event", (t) => ({
  id: t.text().primaryKey(), // Format: transactionHash-logIndex
  collectionAddress: t.text().notNull(),
  tokenId: t.bigint().notNull(),
  from: t.text().notNull(),
  to: t.text().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const collectionOwnership = onchainTable("collection_ownership", (t) => ({
  id: t.text().primaryKey(), // Format: collectionAddress
  owner: t.text().notNull(),
}));

export const listing = onchainTable("listing", (t) => ({
  id: t.text().primaryKey(), // Format: nftAddress-tokenId
  collectionAddress: t.text().notNull(),
  tokenId: t.bigint().notNull(),
  seller: t.text().notNull(),
  price: t.bigint().notNull(),
  expiresAt: t.bigint().notNull(),
  isActive: t.boolean().notNull(),
}));

export const sale = onchainTable("sale", (t) => ({
  id: t.text().primaryKey(), // Format: txHash-logIndex
  collectionAddress: t.text().notNull(),
  tokenId: t.bigint().notNull(),
  buyer: t.text().notNull(),
  seller: t.text().notNull(),
  price: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const offer = onchainTable("offer", (t) => ({
  id: t.text().primaryKey(), // Format: nftAddress-tokenId-bidder
  collectionAddress: t.text().notNull(),
  tokenId: t.bigint().notNull(),
  bidder: t.text().notNull(),
  amount: t.bigint().notNull(),
  expiresAt: t.bigint().notNull(),
  isActive: t.boolean().notNull(),
}));

export const collection = onchainTable("collection", (t) => ({
  id: t.text().primaryKey(), // Format: collectionAddress
  owner: t.text().notNull(),
  name: t.text().notNull(),
  symbol: t.text().notNull(),
  launchedAt: t.bigint().notNull(),
}));