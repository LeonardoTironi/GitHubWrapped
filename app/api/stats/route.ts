/**
 * API Route - GitHub Statistics
 * Returns only the processed data without generating an image
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { processGitHubStats } from "@/app/lib/stats-processor";
import { fetchGitHubStats } from "@/app/lib/github-query";
import { rateLimit, getClientIdentifier } from "@/app/lib/rate-limit";

// Rate limit: 10 requests per minute per client
const RATE_LIMIT_CONFIG = { limit: 10, windowInSeconds: 60 };

export async function GET(req: NextRequest) {
  try {
    // Check rate limit
    const clientId = getClientIdentifier(req);
    const rateLimitResult = rateLimit(clientId, RATE_LIMIT_CONFIG);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.resetIn.toString(),
            "X-RateLimit-Remaining": "0",
          }
        }
      );
    }

    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { data, commitMessages } = await fetchGitHubStats(session);

    const stats = processGitHubStats(data, commitMessages.slice(0, 100));

    return NextResponse.json({
      username: session.user?.login || "unknown",
      year: new Date().getFullYear(),
      category: stats.category,
      auditRatio: stats.auditRatio,
      maxStreak: stats.maxStreak,
      totalCommits: stats.totalCommits,
      createdThisYear: stats.createdThisYear,
      followers: data.user.followers.totalCount,
      topLanguages: stats.topLanguages,
    });
  } catch (error) {
    console.error("Error fetching stats:", error instanceof Error ? error.message : "Unknown error");
    
    // Rate Limit Handling
    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Error fetching statistics" },
      { status: 500 }
    );
  }
}
