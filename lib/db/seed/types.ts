import { db } from "@/lib/db";

export type SeedTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];