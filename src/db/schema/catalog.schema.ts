import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const catalog = pgTable("catalog", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
});
