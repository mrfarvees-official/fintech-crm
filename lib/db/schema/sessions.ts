import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

import { users } from "./users";

export const userSessions = mysqlTable(
  "user_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(), // uuid, doubles as JWT jti

    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    userAgent: varchar("user_agent", { length: 500 }),

    ipAddress: varchar("ip_address", { length: 45 }),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    lastActiveAt: timestamp("last_active_at")
      .notNull()
      .defaultNow()
      .onUpdateNow(),

    expiresAt: timestamp("expires_at").notNull(),

    revokedAt: timestamp("revoked_at"),
  },
  (table) => [
    index("user_sessions_user_idx").on(table.userId),
    index("user_sessions_expires_idx").on(table.expiresAt),
  ],
);
