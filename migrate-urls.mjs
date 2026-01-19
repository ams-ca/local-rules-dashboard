/**
 * Migration script to import court URLs from courtUrls.ts into the database.
 * Run once: tsx migrate-urls.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import { courtUrls } from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

// Court data from courtUrls.ts
const courtData = {
  "cand.uscourts.gov": {
    name: "Northern District of California",
    circuit: "Ninth Circuit",
    urls: {
      localRules: "https://cand.uscourts.gov/rules-forms-fees/local-rules",
      standingOrders: "https://cand.uscourts.gov/judges/standing-orders",
      judges: "https://cand.uscourts.gov/judges",
      generalOrders: "https://cand.uscourts.gov/rules-forms-fees/general-orders",
      procedures: "https://cand.uscourts.gov/cases-e-filing",
    },
    lastVerified: "2026-01-18",
  },
  "casd.uscourts.gov": {
    name: "Southern District of California",
    circuit: "Ninth Circuit",
    urls: {
      localRules: "https://www.casd.uscourts.gov/rules/local-rules.aspx",
      generalOrders: "https://www.casd.uscourts.gov/rules/general-orders.aspx",
      standingOrders: "https://www.casd.uscourts.gov/judges/chambers-rules.aspx",
      judges: "https://www.casd.uscourts.gov/Judges.aspx",
      procedures: "https://www.casd.uscourts.gov/cmecf.aspx#undefined2",
    },
    lastVerified: "2026-01-18",
  },
  "cacd.uscourts.gov": {
    name: "Central District of California",
    circuit: "Ninth Circuit",
    urls: {
      localRules: "https://www.cacd.uscourts.gov/rules/local-rules",
      generalOrders: "https://www.cacd.uscourts.gov/rules/general-orders-and-notices",
      standingOrders: "https://apps.cacd.uscourts.gov/Jps/",
      judges: "https://www.cacd.uscourts.gov/judges-and-staff/judges",
      procedures: "https://www.cacd.uscourts.gov/",
    },
    lastVerified: "2026-01-18",
  },
  "caed.uscourts.gov": {
    name: "Eastern District of California",
    circuit: "Ninth Circuit",
    urls: {
      localRules: "https://www.caed.uscourts.gov/caednew/index.cfm/rules/local-rules/",
      generalOrders: "https://www.caed.uscourts.gov/caednew/index.cfm/rules/general-orders/",
      judges: "https://www.caed.uscourts.gov/caednew/index.cfm/judges/",
      procedures: "https://www.caed.uscourts.gov/caednew/index.cfm/cm-ecf/",
    },
    lastVerified: "2026-01-18",
  },
  "nysd.uscourts.gov": {
    name: "Southern District of New York",
    circuit: "Second Circuit",
    urls: {
      localRules: "https://www.nysd.uscourts.gov/rules",
      standingOrders: "https://www.nysd.uscourts.gov/hon-judges-individual-practices-procedures-and-schedules",
      judges: "https://www.nysd.uscourts.gov/judges",
      generalOrders: "https://www.nysd.uscourts.gov/general-orders",
      procedures: "https://www.nysd.uscourts.gov/electronic-case-filing",
    },
    lastVerified: "2026-01-18",
  },
  "nyed.uscourts.gov": {
    name: "Eastern District of New York",
    circuit: "Second Circuit",
    urls: {
      localRules: "https://www.nyed.uscourts.gov/rules-orders/local-rules",
      standingOrders: "https://www.nyed.uscourts.gov/rules-orders/standing-orders",
      judges: "https://www.nyed.uscourts.gov/judges",
      generalOrders: "https://www.nyed.uscourts.gov/rules-orders/general-orders",
      procedures: "https://www.nyed.uscourts.gov/electronic-filing-ecf",
    },
    lastVerified: "2026-01-18",
  },
  "nynd.uscourts.gov": {
    name: "Northern District of New York",
    circuit: "Second Circuit",
    urls: {
      localRules: "https://www.nynd.uscourts.gov/local-rules",
      judges: "https://www.nynd.uscourts.gov/judges",
      generalOrders: "https://www.nynd.uscourts.gov/general-orders",
      procedures: "https://www.nynd.uscourts.gov/cm-ecf",
    },
    lastVerified: "2026-01-18",
  },
  "nywd.uscourts.gov": {
    name: "Western District of New York",
    circuit: "Second Circuit",
    urls: {
      localRules: "https://www.nywd.uscourts.gov/local-rules-and-orders",
      judges: "https://www.nywd.uscourts.gov/judges",
      generalOrders: "https://www.nywd.uscourts.gov/general-orders",
      procedures: "https://www.nywd.uscourts.gov/cm-ecf-information",
    },
    lastVerified: "2026-01-18",
  },
};

// Category metadata
const categoryInfo = {
  localRules: {
    title: "Local Rules",
    description: "Local rules of civil, criminal, bankruptcy, admiralty, and other procedural rules.",
  },
  standingOrders: {
    title: "Standing Orders",
    description: "Standing orders from judges. Browse by judge name to find judge-specific standing orders.",
  },
  judges: {
    title: "Judges Directory",
    description: "Directory of judges. Each judge's page includes contact information, staff directory, courtroom location, calendar, and procedural requirements.",
  },
  generalOrders: {
    title: "General Orders",
    description: "Administrative orders and court-wide policies.",
  },
  procedures: {
    title: "Court Procedures",
    description: "Filing procedures, electronic filing requirements, and administrative information.",
  },
};

async function migrate() {
  console.log("Starting migration...");
  
  let totalInserted = 0;
  
  for (const [courtId, court] of Object.entries(courtData)) {
    console.log(`\nProcessing ${court.name}...`);
    
    for (const [category, url] of Object.entries(court.urls)) {
      const categoryData = categoryInfo[category];
      if (!categoryData) {
        console.warn(`  Warning: No metadata for category "${category}", skipping`);
        continue;
      }
      
      try {
        await db.insert(courtUrls).values({
          courtId,
          courtName: court.name,
          circuit: court.circuit,
          category,
          url,
          title: categoryData.title,
          description: categoryData.description,
          lastVerified: new Date(court.lastVerified),
          isActive: 1,
          updatedBy: "migration_script",
        });
        
        console.log(`  ✓ Inserted ${category}: ${url}`);
        totalInserted++;
      } catch (error) {
        console.error(`  ✗ Failed to insert ${category}:`, error.message);
      }
    }
  }
  
  console.log(`\n✅ Migration complete! Inserted ${totalInserted} URLs for ${Object.keys(courtData).length} courts.`);
  process.exit(0);
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
