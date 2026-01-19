import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { findCourt, getAllCourts, normalizeJudgeName, normalizeCaseType } from "./courtMapper";
import { scrapeCourtWebsite } from "./courtScraper";
import type { SearchResponse } from "@shared/types";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import * as aiResearchAgent from "./aiResearchAgent";
import * as urlVerifier from "./urlVerifier";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  search: router({
    getStates: publicProcedure.query(async () => {
      return await db.getDistinctStates();
    }),
    
    getCourtsByState: publicProcedure
      .input(z.object({ state: z.string().optional() }))
      .query(async ({ input }) => {
        if (!input.state || input.state === "Federal") {
          // Return all courts
          return await db.getAllCourtsList();
        }
        // Return courts for specific state
        return await db.getCourtsByState(input.state);
      }),
    
    getSupportedCourts: publicProcedure.query(() => {
      return getAllCourts().map(court => ({
        id: court.id,
        name: court.name,
        circuit: court.circuit,
      }));
    }),
    
    findRules: publicProcedure
      .input(
        z.object({
          court: z.string(), // courtId like "cand", "nysd"
        })
      )
      .mutation(async ({ input }): Promise<SearchResponse> => {
        const { court: courtId } = input;

        // Get court URLs from database
        const courtUrlsData = await db.getActiveCourtUrlsByCourtId(courtId);
        
        if (courtUrlsData.length === 0) {
          throw new Error(
            `Court "${courtId}" not found. Please check the court name or abbreviation and try again.`
          );
        }

        // Get court name from first result
        const courtName = courtUrlsData[0].courtName;

        // Group URLs by category
        const categoryMap = new Map<string, Array<{ title: string; url: string; verifiedDate?: Date }>>();
        
        for (const urlData of courtUrlsData) {
          if (!categoryMap.has(urlData.category)) {
            categoryMap.set(urlData.category, []);
          }
          categoryMap.get(urlData.category)!.push({
            title: urlData.title,
            url: urlData.url,
            verifiedDate: urlData.lastVerified ? new Date(urlData.lastVerified) : undefined,
          });
        }

        // Convert to results format
        const results = Array.from(categoryMap.entries()).map(([category, links]) => ({
          category,
          links,
        }));

        // Generate AI explanation of court structure
        const explanationPrompt = `You are a legal research assistant helping users understand how federal court websites organize their rules and procedures.

Court: ${courtName}

Provide a brief, helpful explanation (2-3 sentences) about how this court organizes its local rules, standing orders, general orders, and judge-specific information. Include:
1. The basic structure of local rules (civil, criminal, admiralty, etc.)
2. How standing orders and general orders work
3. That each judge has their own chambers page with calendar, staff directory, and procedural requirements
4. How to find court procedures and forms

Keep it concise, practical, and user-friendly. Do not use bullet points.`;

        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: "You are a helpful legal research assistant." },
            { role: "user", content: explanationPrompt },
          ],
        });

        const messageContent = llmResponse.choices[0]?.message?.content;
        const explanation = typeof messageContent === 'string' ? messageContent : "";

        return {
          query: {
            court: courtName,
          },
          explanation,
          results,
        };
      }),
  }),

  admin: router({
    getAllCourtUrls: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return await db.getAllCourtUrls();
    }),

    updateCourtUrl: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          url: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          lastVerified: z.date().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { id, ...updates } = input;
        return await db.updateCourtUrl(id, updates, ctx.user.name || ctx.user.email || 'admin');
      }),

    createCourtUrl: protectedProcedure
      .input(
        z.object({
          courtId: z.string(),
          courtName: z.string(),
          circuit: z.string().optional(),
          category: z.string(),
          url: z.string(),
          title: z.string(),
          description: z.string().optional(),
          lastVerified: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return await db.createCourtUrl({
          ...input,
          isActive: 1,
          updatedBy: ctx.user.name || ctx.user.email || 'admin',
        });
      }),

    deleteCourtUrl: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return await db.deleteCourtUrl(input.id, ctx.user.name || ctx.user.email || 'admin');
      }),

    // AI Research endpoints
    researchCourt: protectedProcedure
      .input(
        z.object({
          courtId: z.string(),
          courtName: z.string(),
          circuit: z.string().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const result = await aiResearchAgent.researchCourtWebsite(
          input.courtId,
          input.courtName,
          input.circuit
        );
        await aiResearchAgent.saveResearchResults(result);
        return result;
      }),

    getPendingUrls: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return await db.getPendingUrls();
    }),

    approvePendingUrl: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return await db.approvePendingUrl(input.id, ctx.user.name || ctx.user.email || 'admin');
      }),

    rejectPendingUrl: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return await db.rejectPendingUrl(input.id, ctx.user.name || ctx.user.email || 'admin');
      }),

    // URL Verification endpoints
    verifyCourtUrls: protectedProcedure
      .input(z.object({ courtId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return await urlVerifier.verifyCourtUrls(input.courtId);
      }),

    verifyAllUrls: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return await urlVerifier.verifyAllUrls();
    }),

    getBrokenUrls: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return await urlVerifier.getBrokenUrls();
    }),
  }),
});

export type AppRouter = typeof appRouter;
