import { timestamp } from "drizzle-orm/pg-core";
import { doublePrecision, pgTable, text } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey().default("uuid_generate_v4()"),
  name: text("name").notNull(),
  imageId: text("imageId").notNull(),
  price: doublePrecision("price").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export type Product = typeof productsTable.$inferSelect
