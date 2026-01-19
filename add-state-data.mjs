import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { courtUrls } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Map court IDs to their state abbreviations
const courtStateMap = {
  "cand.uscourts.gov": "CA",
  "casd.uscourts.gov": "CA",
  "cacd.uscourts.gov": "CA",
  "caed.uscourts.gov": "CA",
  "nysd.uscourts.gov": "NY",
  "nyed.uscourts.gov": "NY",
  "nynd.uscourts.gov": "NY",
  "nywd.uscourts.gov": "NY",
};

async function addStateData() {
  console.log("Adding state data to existing courts...");
  
  for (const [courtId, state] of Object.entries(courtStateMap)) {
    const result = await db
      .update(courtUrls)
      .set({ state })
      .where(eq(courtUrls.courtId, courtId));
    
    console.log(`Updated ${courtId} with state: ${state}`);
  }
  
  console.log("State data migration complete!");
  process.exit(0);
}

addStateData().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
