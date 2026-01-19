/**
 * URL Verification System
 * Validates existing court URLs to ensure they remain accessible
 */

import axios from "axios";
import * as db from "./db";
import { courtUrls, urlVerificationLog, InsertUrlVerificationLog } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface VerificationResult {
  courtUrlId: number;
  url: string;
  isAccessible: boolean;
  statusCode?: number;
  redirectUrl?: string;
  errorMessage?: string;
  responseTime: number;
}

/**
 * Verify a single URL and log the result
 */
export async function verifyUrl(courtUrlId: number, url: string): Promise<VerificationResult> {
  const startTime = Date.now();
  let result: VerificationResult = {
    courtUrlId,
    url,
    isAccessible: false,
    responseTime: 0,
  };
  
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept any status < 500
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FederalCourtRulesBot/1.0)",
      },
    });
    
    result.responseTime = Date.now() - startTime;
    result.statusCode = response.status;
    result.isAccessible = response.status >= 200 && response.status < 400;
    
    // Check for redirects
    if (response.request?.res?.responseUrl && response.request.res.responseUrl !== url) {
      result.redirectUrl = response.request.res.responseUrl;
    }
    
  } catch (error: any) {
    result.responseTime = Date.now() - startTime;
    result.isAccessible = false;
    
    if (error.response) {
      result.statusCode = error.response.status;
      result.errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
    } else if (error.code === "ECONNABORTED") {
      result.errorMessage = "Request timeout";
    } else if (error.code === "ENOTFOUND") {
      result.errorMessage = "Domain not found";
    } else {
      result.errorMessage = error.message || "Unknown error";
    }
  }
  
  // Log verification result to database
  await logVerificationResult(result);
  
  // Update lastVerified timestamp if accessible
  if (result.isAccessible) {
    await updateLastVerified(courtUrlId);
  }
  
  return result;
}

/**
 * Verify all URLs for a specific court
 */
export async function verifyCourtUrls(courtId: string): Promise<VerificationResult[]> {
  console.log(`[URL Verifier] Starting verification for court: ${courtId}`);
  
  const urls = await db.getActiveCourtUrlsByCourtId(courtId);
  const results: VerificationResult[] = [];
  
  for (const url of urls) {
    console.log(`[URL Verifier] Checking ${url.url}`);
    const result = await verifyUrl(url.id, url.url);
    results.push(result);
    
    // Add delay between requests to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  const accessible = results.filter((r) => r.isAccessible).length;
  const total = results.length;
  console.log(`[URL Verifier] Verification complete: ${accessible}/${total} URLs accessible`);
  
  return results;
}

/**
 * Verify all URLs in the database
 */
export async function verifyAllUrls(): Promise<VerificationResult[]> {
  console.log(`[URL Verifier] Starting verification for all courts`);
  
  const allUrls = await db.getAllCourtUrls();
  const results: VerificationResult[] = [];
  
  for (const url of allUrls) {
    if (url.isActive !== 1) continue; // Skip inactive URLs
    
    console.log(`[URL Verifier] Checking ${url.url}`);
    const result = await verifyUrl(url.id, url.url);
    results.push(result);
    
    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  const accessible = results.filter((r) => r.isAccessible).length;
  const total = results.length;
  console.log(`[URL Verifier] Verification complete: ${accessible}/${total} URLs accessible`);
  
  return results;
}

/**
 * Get verification history for a specific URL
 */
export async function getVerificationHistory(courtUrlId: number, limit: number = 10) {
  const database = await db.getDb();
  if (!database) {
    return [];
  }
  
  const results = await database
    .select()
    .from(urlVerificationLog)
    .where(eq(urlVerificationLog.courtUrlId, courtUrlId))
    .orderBy(urlVerificationLog.checkedAt)
    .limit(limit);
  
  return results;
}

/**
 * Get all broken URLs (most recent check failed)
 */
export async function getBrokenUrls() {
  const database = await db.getDb();
  if (!database) {
    return [];
  }
  
  // Get all active court URLs
  const allUrls = await database
    .select()
    .from(courtUrls)
    .where(eq(courtUrls.isActive, 1));
  
  const brokenUrls = [];
  
  for (const url of allUrls) {
    // Get most recent verification log
    const recentLog = await database
      .select()
      .from(urlVerificationLog)
      .where(eq(urlVerificationLog.courtUrlId, url.id))
      .orderBy(urlVerificationLog.checkedAt)
      .limit(1);
    
    if (recentLog.length > 0 && recentLog[0].isAccessible === 0) {
      brokenUrls.push({
        ...url,
        lastCheck: recentLog[0],
      });
    }
  }
  
  return brokenUrls;
}

/**
 * Log verification result to database
 */
async function logVerificationResult(result: VerificationResult): Promise<void> {
  const database = await db.getDb();
  if (!database) {
    console.warn("[URL Verifier] Cannot log result: database not available");
    return;
  }
  
  const logEntry: InsertUrlVerificationLog = {
    courtUrlId: result.courtUrlId,
    checkedAt: new Date(),
    statusCode: result.statusCode || null,
    isAccessible: result.isAccessible ? 1 : 0,
    redirectUrl: result.redirectUrl || null,
    errorMessage: result.errorMessage || null,
    responseTime: result.responseTime,
  };
  
  await database.insert(urlVerificationLog).values(logEntry);
}

/**
 * Update lastVerified timestamp for a court URL
 */
async function updateLastVerified(courtUrlId: number): Promise<void> {
  const database = await db.getDb();
  if (!database) {
    return;
  }
  
  await database
    .update(courtUrls)
    .set({ lastVerified: new Date() })
    .where(eq(courtUrls.id, courtUrlId));
}
