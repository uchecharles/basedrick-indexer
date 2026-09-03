import { onchainTable } from "ponder";

export const collection = onchainTable("collection", (t) => ({
  id: t.text().primaryKey(), // The contract address
  creator: t.text().notNull(),
  launchedAt: t.integer().notNull(),
}));

export const sale = onchainTable("sale", (t) => ({
  id: t.text().primaryKey(), // txHash + logIndex
  collectionAddress: t.text().notNull(),
  tokenId: t.integer().notNull(),
  buyer: t.text().notNull(),
  price: t.bigint().notNull(),
  timestamp: t.integer().notNull(),
}));