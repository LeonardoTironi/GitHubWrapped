/**
 * API Route - Wrapped Generation
 * Collects GitHub data and generates a PNG image
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import satori from "satori";
import sharp from "sharp";
import { readFile } from "fs/promises";
import path from "path";
import { WrappedCard } from "@/app/components/WrappedCard";
import { processGitHubStats } from "@/app/lib/stats-processor";
import { fetchGitHubStats } from "@/app/lib/github-query";
import { rateLimit, getClientIdentifier } from "@/app/lib/rate-limit";

// Rate limit: 5 requests per minute (image generation is expensive)
const RATE_LIMIT_CONFIG = { limit: 5, windowInSeconds: 60 };

export async function GET(req: NextRequest) {
  try {
    

    // Check rate limit first (before expensive operations)
    const clientId = getClientIdentifier(req);
    const rateLimitResult = rateLimit(clientId + "-generate", RATE_LIMIT_CONFIG);
    
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

    // ✅ SEGURO: Verifica autenticação
    const session = await auth();
    
    if (!session?.user) {
      console.error('[API/GENERATE] ERROR: No session found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = (session as any).accessToken;
    const login = (session as any).user?.login || session.user.name;
    
    
    if (!accessToken) {
      console.error('[API/GENERATE] ERROR: No access token in session');
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
    
    // 1. Fetch GitHub data
    const { data, commitMessages } = await fetchGitHubStats(sessionWithToken);

    // 2. Process statistics
    const stats = processGitHubStats(data, commitMessages.slice(0, 100));

    // 3. Prepare data for the card
    const wrappedData = {
      username: session.user?.login || "unknown",
      year: new Date().getFullYear(),
      category: stats.category,
      auditRatio: stats.auditRatio,
      max_streak: stats.maxStreak,
      totalCommits: stats.totalCommits,
      createdThisYear: stats.createdThisYear,
      followers: data.user.followers.totalCount,
      topLanguages: stats.topLanguages,
    };

    // 4. Generate SVG with Satori
    const fontPath400 = path.join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff");
    const fontPath700 = path.join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff");
    
    const svg = await satori(
      WrappedCard({ data: wrappedData }),
      {
        width: 900,
        height: 1300,
        fonts: [
          {
            name: "Inter",
            data: await readFile(fontPath400),
            weight: 400,
            style: "normal",
          },
          {
            name: "Inter",
            data: await readFile(fontPath700),
            weight: 700,
            style: "normal",
          },
        ],
      }
    );

    // 5. Convert SVG to PNG
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    // 6. Return the image
    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating wrapped:", error instanceof Error ? error.message : "Unknown error");
    
    // Rate Limit Handling
    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Error generating wrapped" },
      { status: 500 }
    );
  }
}
