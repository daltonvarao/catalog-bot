import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config";
import { catalog } from "./schema/catalog.schema";

export const db = drizzle(config.database.url, {
  schema: {
    catalog,
  },
});
