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

    // ✅ SEGURO: Usa auth() customizado para obter token
    const session = await auth();
    
    if (!session?.user) {
      console.error('[API/STATS] ERROR: No session found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Em NextAuth v5, precisamos acessar o token via callbacks ou request
    // Vamos usar uma abordagem alternativa: pegar do request context
    const authHeader = req.headers.get('authorization');
    
    // Como o token está no JWT (cookie), vamos usar a API do NextAuth
    // O problema é que getToken() não está funcionando, então vamos
    // forçar o uso de Server Action
    const accessToken = (session as any).accessToken;
    const login = (session as any).user?.login || session.user.name;
    
    
    if (!accessToken) {
      console.error('[API/STATS] ERROR: No access token in session');
      console.error('[API/STATS] Session object:', JSON.stringify(session, null, 2));
      return NextResponse.json({ 
        error: "No GitHub access token. Please logout and login again." 
      }, { status: 401 });
    }
    
    // Cria objeto de sessão com accessToken apenas para uso interno
    const sessionWithToken = {
      ...session,
      accessToken: accessToken as string,
      login: login as string,
    };
    
    const { data, commitMessages } = await fetchGitHubStats(sessionWithToken);

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
    console.error('[API/STATS] ERROR:', error instanceof Error ? error.message : "Unknown error");
    console.error('[API/STATS] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
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
