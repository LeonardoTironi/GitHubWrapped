/**
 * Results Page - GitHub Wrapped 2025
 * Displays the visual result and allows image download
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LogoutButton from "@/app/components/LogoutButton";

interface WrappedStats {
  username: string;
  year: number;
  category: string;
  auditRatio: string;
  maxStreak: number;
  totalCommits: number;
  createdThisYear: number;
  followers: number;
  topLanguages: Array<{
    name: string;
    color: string;
    percentage: number;
  }>;
}

export default function WrappedPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    // Check if image is saved in sessionStorage (more secure than localStorage)
    const savedImage = sessionStorage.getItem("github-wrapped-image");
    const savedStats = sessionStorage.getItem("github-wrapped-stats");

    if (savedImage && savedStats) {
      setImageUrl(savedImage);
      try {
        setStats(JSON.parse(savedStats));
        setHasGenerated(true);
      } catch {
        // Invalid JSON, clear storage
        sessionStorage.removeItem("github-wrapped-image");
        sessionStorage.removeItem("github-wrapped-stats");
      }
    }
  }, []);

  const generateWrapped = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch statistics
      const statsResponse = await fetch("/api/stats");
      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error fetching statistics");
      }
      const statsData = await statsResponse.json();
      setStats(statsData);

      // 2. Generate the image
      const imageResponse = await fetch("/api/generate-wrapped");
      if (!imageResponse.ok) {
        throw new Error("Error generating image");
      }

      const blob = await imageResponse.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

      // Save to sessionStorage (cleared when tab closes - more secure)
      sessionStorage.setItem("github-wrapped-image", url);
      sessionStorage.setItem("github-wrapped-stats", JSON.stringify(statsData));
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `github-wrapped-2025.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTwitterShare = () => {
    if (!stats) return;

    const text = `🎉 My GitHub Wrapped 2025! 🚀\n\n✨ ${stats.category}\n💻 ${stats.totalCommits} commits\n🔥 ${stats.maxStreak} day streak\n\nCheck yours at github-wrapped-2025.vercel.app\n\n#GitHubWrapped #Coding`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
  };

  const handleLinkedInShare = () => {
    if (!stats) return;

    const text = `I'm excited to share my GitHub Wrapped 2025! 🎉\n\n📊 Category: ${
      stats.category
    }\n💻 Total Commits: ${stats.totalCommits}\n🔥 Max Streak: ${
      stats.maxStreak
    } consecutive days\n🌟 Top Languages: ${stats.topLanguages
      .slice(0, 3)
      .map((l) => l.name)
      .join(
        ", "
      )}\n\nWhat were your coding highlights this year? Create yours at github-wrapped-2025.vercel.app\n\n#GitHubWrapped #SoftwareDevelopment #Coding`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      "https://github-wrapped-2025.vercel.app"
    )}&summary=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleInstagramShare = () => {
    handleDownload();
    alert(
      "Image downloaded! Now you can share it on Instagram from your gallery."
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Generating your Wrapped 2025...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-white mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            Back to Home
          </button>
          <LogoutButton />
        </div>
      </div>
    );
  }

  // Show Generate Button if no image yet
  if (!hasGenerated && !imageUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-5xl font-bold text-white mb-6">
            Ready to see your GitHub Wrapped 2025?
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Click the button below to generate your personalized stats card
          </p>
          <button
            onClick={generateWrapped}
            className="px-12 py-6 bg-linear-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-2xl cursor-pointer"
          >
            🎉 Generate My Wrapped
          </button>
          <div className="mt-12">
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-4xl w-full">
        {/* Image of the Wrapped */}
        {imageUrl && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <Image
              src={imageUrl}
              alt="GitHub Wrapped 2025"
              width={900}
              height={1300}
              className="w-full rounded-lg shadow-2xl"
              unoptimized
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Image
          </button>

          {/* Share Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition-all transform hover:scale-105 shadow-xl cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
              <svg
                className={`w-4 h-4 transition-transform ${
                  showShareMenu ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showShareMenu && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-gray-800 rounded-xl shadow-2xl overflow-hidden z-10 min-w-62.5">
                <button
                  onClick={() => {
                    handleTwitterShare();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-700 transition-colors text-white cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="font-semibold">Share on Twitter</span>
                </button>

                <button
                  onClick={() => {
                    handleLinkedInShare();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-700 transition-colors text-white cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="font-semibold">Share on LinkedIn</span>
                </button>

                <button
                  onClick={() => {
                    handleInstagramShare();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-700 transition-colors text-white cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="font-semibold">Share on Instagram</span>
                </button>
              </div>
            )}
          </div>

          <div className="py-4 text-white font-semibold rounded-full  transition-all">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
