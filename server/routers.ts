import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { findCourt, normalizeJudgeName, normalizeCaseType } from "./courtMapper";
import { scrapeCourtWebsite } from "./courtScraper";
import type { SearchResponse } from "@shared/types";

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
    findRules: publicProcedure
      .input(
        z.object({
          judgeName: z.string().optional(),
          court: z.string(),
          caseType: z.string().optional(),
        })
      )
      .mutation(async ({ input }): Promise<SearchResponse> => {
        const { judgeName, court, caseType } = input;

        // Find court information
        const courtInfo = findCourt(court);
        if (!courtInfo) {
          throw new Error(
            `Court "${court}" not found. Please check the court name or abbreviation and try again.`
          );
        }

        // Normalize inputs
        const normalizedJudge = judgeName ? normalizeJudgeName(judgeName) : undefined;
        const normalizedCaseType = caseType ? normalizeCaseType(caseType) : undefined;

        // Scrape court website
        const results = await scrapeCourtWebsite({
          courtUrl: courtInfo.url,
          courtName: courtInfo.name,
          judgeName: normalizedJudge,
          caseType: normalizedCaseType,
        });

        return {
          query: {
            judgeName: normalizedJudge,
            court: courtInfo.name,
            caseType: normalizedCaseType,
          },
          results,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
