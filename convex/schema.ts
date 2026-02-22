import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  analyses: defineTable({
    userId: v.id("users"),
    imageUrl: v.string(),
    storageId: v.optional(v.id("_storage")),
    filename: v.string(),
    verdict: v.union(v.literal("REAL"), v.literal("AI_GENERATED"), v.literal("ANALYZING")),
    confidence: v.number(),
    analysisDetails: v.optional(v.object({
      artifactScore: v.number(),
      patternConsistency: v.number(),
      noiseAnalysis: v.number(),
      colorDistribution: v.number(),
      edgeCoherence: v.number(),
      metadataScore: v.number(),
    })),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_created", ["createdAt"]),
});
