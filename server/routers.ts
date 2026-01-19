import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { findCourt, getAllCourts, normalizeJudgeName, normalizeCaseType } from "./courtMapper";
import { scrapeCourtWebsite } from "./courtScraper";
import type { SearchResponse } from "@shared/types";
import { invokeLLM } from "./_core/llm";

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
          court: z.string(),
        })
      )
      .mutation(async ({ input }): Promise<SearchResponse> => {
        const { court } = input;

        // Find court information
        const courtInfo = findCourt(court);
        if (!courtInfo) {
          throw new Error(
            `Court "${court}" not found. Please check the court name or abbreviation and try again.`
          );
        }

        // Scrape court website
        const results = await scrapeCourtWebsite(
          courtInfo.url,
          courtInfo.name
        );

        // Generate AI explanation of court structure
        const explanationPrompt = `You are a legal research assistant helping users understand how federal court websites organize their rules and procedures.

Court: ${courtInfo.name}

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
            court: courtInfo.name,
          },
          explanation,
          results,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
