import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, real: 0, ai: 0 };

    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const completed = analyses.filter(a => a.verdict !== "ANALYZING");
    return {
      total: completed.length,
      real: completed.filter(a => a.verdict === "REAL").length,
      ai: completed.filter(a => a.verdict === "AI_GENERATED").length,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Failed to get image URL");

    const analysisId = await ctx.db.insert("analyses", {
      userId,
      imageUrl,
      storageId: args.storageId,
      filename: args.filename,
      verdict: "ANALYZING",
      confidence: 0,
      createdAt: Date.now(),
    });

    return analysisId;
  },
});

export const updateAnalysis = mutation({
  args: {
    id: v.id("analyses"),
    verdict: v.union(v.literal("REAL"), v.literal("AI_GENERATED")),
    confidence: v.number(),
    analysisDetails: v.object({
      artifactScore: v.number(),
      patternConsistency: v.number(),
      noiseAnalysis: v.number(),
      colorDistribution: v.number(),
      edgeCoherence: v.number(),
      metadataScore: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      verdict: args.verdict,
      confidence: args.confidence,
      analysisDetails: args.analysisDetails,
    });
  },
});

export const analyzeImage = action({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    // Simulate sophisticated AI detection analysis
    // In production, this would call actual ML models
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

    // Generate realistic analysis scores
    const artifactScore = Math.random() * 100;
    const patternConsistency = Math.random() * 100;
    const noiseAnalysis = Math.random() * 100;
    const colorDistribution = Math.random() * 100;
    const edgeCoherence = Math.random() * 100;
    const metadataScore = Math.random() * 100;

    // Calculate weighted average for verdict
    const overallScore = (
      artifactScore * 0.2 +
      patternConsistency * 0.2 +
      noiseAnalysis * 0.15 +
      colorDistribution * 0.15 +
      edgeCoherence * 0.15 +
      metadataScore * 0.15
    );

    const verdict = overallScore > 50 ? "AI_GENERATED" : "REAL";
    const confidence = Math.min(99.97, 85 + Math.random() * 14.97);

    await ctx.runMutation(api.analyses.updateAnalysis, {
      id: args.analysisId,
      verdict,
      confidence,
      analysisDetails: {
        artifactScore,
        patternConsistency,
        noiseAnalysis,
        colorDistribution,
        edgeCoherence,
        metadataScore,
      },
    });
  },
});

export const remove = mutation({
  args: { id: v.id("analyses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const analysis = await ctx.db.get(args.id);
    if (!analysis || analysis.userId !== userId) {
      throw new Error("Not found");
    }

    if (analysis.storageId) {
      await ctx.storage.delete(analysis.storageId);
    }
    await ctx.db.delete(args.id);
  },
});
