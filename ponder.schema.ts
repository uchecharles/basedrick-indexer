import { onchainTable } from "ponder";

export const collection = onchainTable("collection", (t) => ({
  id: t.text().primaryKey(), // collection address
  creator: t.text().notNull(),
  name: t.text().notNull(),
  symbol: t.text().notNull(),
  launchedAt: t.integer().notNull(),
}));

export const sale = onchainTable("sale", (t) => ({
  id: t.text().primaryKey(), // transactionHash-tokenId
  collectionAddress: t.text().notNull(),
  tokenId: t.integer().notNull(),
  buyer: t.text().notNull(),
  seller: t.text().notNull(),
  price: t.bigint().notNull(),
  timestamp: t.integer().notNull(),
  saleType: t.text().notNull(), // "Purchase" or "OfferAccepted"
}));

export const listing = onchainTable("listing", (t) => ({
  id: t.text().primaryKey(), // collectionAddress-tokenId
  collectionAddress: t.text().notNull(),
  tokenId: t.integer().notNull(),
  seller: t.text().notNull(),
  price: t.bigint().notNull(),
  expiresAt: t.integer().notNull(),
  isActive: t.boolean().notNull(),
}));

export const offer = onchainTable("offer", (t) => ({
  id: t.text().primaryKey(), // collectionAddress-tokenId-bidder
  collectionAddress: t.text().notNull(),
  tokenId: t.integer().notNull(),
  bidder: t.text().notNull(),
  amount: t.bigint().notNull(),
  expiresAt: t.integer().notNull(),
  isActive: t.boolean().notNull(),
}));