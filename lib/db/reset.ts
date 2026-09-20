import { config } from "dotenv";
import mysql from "mysql2/promise";

config({
  path: ".env",
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined.");
}

async function reset() {
  const url = new URL(databaseUrl ?? '');

  const database = url.pathname.replace("/", "");

  if (!database) {
    throw new Error("Database name could not be resolved.");
  }

  const connection = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: url.username,
    password: url.password,
  });

  console.log(`🗑️ Dropping database: ${database}`);

  await connection.query(
    `DROP DATABASE IF EXISTS \`${database}\``,
  );

  console.log(`📦 Creating database: ${database}`);

  await connection.query(
    `CREATE DATABASE \`${database}\``,
  );

  await connection.end();

  console.log("✅ Database reset completed.");
}

reset().catch((error) => {
  console.error("❌ Database reset failed:");
  console.error(error);
  process.exit(1);
});