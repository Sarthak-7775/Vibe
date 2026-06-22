import { Client } from 'pg';
import "dotenv/config";

async function main() {
  console.log("Testing Pooler URL...");
  const poolerClient = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await poolerClient.connect();
    console.log("Pooler connection SUCCESS!");
    await poolerClient.end();
  } catch (err) {
    console.error("Pooler connection FAILED:", err.message);
  }

  console.log("\nTesting Direct URL...");
  const directClient = new Client({ connectionString: process.env.DIRECT_URL });
  try {
    await directClient.connect();
    console.log("Direct connection SUCCESS!");
    await directClient.end();
  } catch (err) {
    console.error("Direct connection FAILED:", err.message);
  }
}

main();
