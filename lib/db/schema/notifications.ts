import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";
import { users } from "./users";

export const notifications = mysqlTable(
  "notifications",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organizations.id),

    userId: bigint("user_id", {
      mode: "number",
    })
      .notNull()
      .references(() => users.id),

    type: varchar("type", {
      length: 100,
    }).notNull(),

    title: varchar("title", {
      length: 255,
    }).notNull(),

    message: text("message").notNull(),

    readAt: timestamp("read_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),

    index("notifications_org_idx").on(table.organizationId),
  ],
);
