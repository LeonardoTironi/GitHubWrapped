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
    const savedImage = sessionStorage.getItem("dev-wrapped-image");
    const savedStats = sessionStorage.getItem("dev-wrapped-stats");

    if (savedImage && savedStats) {
      setImageUrl(savedImage);
      try {
        setStats(JSON.parse(savedStats));
        setHasGenerated(true);
      } catch {
        // Invalid JSON, clear storage
        sessionStorage.removeItem("dev-wrapped-image");
        sessionStorage.removeItem("dev-wrapped-stats");
      }
    }
  }, []);
  const getImageFile = () => {
    if (!imageUrl) return null;
    const [mimeInfo, base64] = imageUrl.split(",");
    const mime = mimeInfo.split(":")[1].split(";")[0];
    const bytes = atob(base64);
    const array = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      array[i] = bytes.charCodeAt(i);
    }
    return new File([array], "dev-wrapped-2025.png", { type: mime });
  };

  const handleShareImage = async () => {
    if (!stats || !imageUrl) return;
    const file = getImageFile();
    if (!file || !navigator.share) return;
    const text = `Check out my Dev Wrapped 2025! 🎉\n\n📊 Category: ${
      stats.category
    }\n💻 Total Commits: ${stats.totalCommits}\n🔥 Max Streak: ${
      stats.maxStreak
    } consecutive days\n🌟 Top Languages: ${stats.topLanguages
      .slice(0, 3)
      .map((l) => l.name)
      .join(
        ", "
      )}\n\nCreate yours at dev-wrapped-2025.vercel.app\n\n#DevWrapped #SoftwareDevelopment #Coding`;
    try {
      await navigator.share({
        title: "Dev Wrapped 2025",
        text: text,
        files: [file],
        url: "https://dev-wrapped-2025.vercel.app",
      });
    } catch (err) {
      console.error("Share failed", err);
      // Fallback: copy text to clipboard or alert
      navigator.clipboard.writeText(
        `${text}\n${"https://dev-wrapped-2025.vercel.app"}`
      );
      alert("Link copiado para a área de transferência!");
    }
  };
  const generateWrapped = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsResponse = await fetch("/api/stats");

      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          router.push("/");
          return;
        }
        const errorData = await statsResponse
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error ||
            `Erro ao buscar estatísticas (${statsResponse.status})`
        );
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // 2. Generate the image
      const imageResponse = await fetch("/api/generate-wrapped");

      if (!imageResponse.ok) {
        const errorData = await imageResponse
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error || `Erro ao gerar imagem (${imageResponse.status})`
        );
      }

      const blob = await imageResponse.blob();

      // Converte blob para base64 para salvar no sessionStorage
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          sessionStorage.setItem("dev-wrapped-image", base64data);
          setImageUrl(base64data);
          resolve(null);
        };
      });

      sessionStorage.setItem("dev-wrapped-stats", JSON.stringify(statsData));
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
    link.href = imageUrl; // Já é base64, funciona direto
    link.download = `dev-wrapped-${new Date().getFullYear()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTwitterShare = () => {
    if (!stats) return;

    const text = `🎉 My Dev Wrapped 2025!\n\n💻 ${stats.category}\n🚀 ${stats.totalCommits} commits\n🔥 ${stats.maxStreak} day streak\n\nCheck yours at dev-wrapped-2025.vercel.app\n\n#DevWrapped #Coding`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
  };

  const handleLinkedInShare = () => {
    if (!stats) return;

    const text = `I'm excited to share my Dev Wrapped 2025! 🎉\n\n📊 Category: ${
      stats.category
    }\n🚀 Total Commits: ${stats.totalCommits}\n🔥 Max Streak: ${
      stats.maxStreak
    } consecutive days\n🌟 Top Languages: ${stats.topLanguages
      .slice(0, 3)
      .map((l) => l.name)
      .join(
        ", "
      )}\n\nWhat were your coding highlights this year? Create yours at dev-wrapped-2025.vercel.app\n\n#DevWrapped #SoftwareDevelopment #Coding`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      "https://dev-wrapped-2025.vercel.app"
    )}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400">
            Compiling your year...
          </h2>
          <p className="text-gray-400 mt-2">
            Analysing commits and pull requests
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={generateWrapped}
              className="w-full py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show Generate Button if no image yet
  if (!hasGenerated && !imageUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] p-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Your Year in{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-500 to-red-500">
              Code
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
            We've analyzed your GitHub activity. Ready to see your personalized
            2025 developer report?
          </p>
          <button
            onClick={generateWrapped}
            className="group relative px-12 py-6 bg-linear-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(168,85,247,0.4)] cursor-pointer"
          >
            Generate My Wrapped
          </button>
          <div className="mt-8">
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <header className="text-center mb-10">
          <h2 className="text-sm font-bold text-blue-500 uppercase tracking-[0.2em] mb-2">
            Dev Wrapped 2025
          </h2>
        </header>

        {/* Card Preview */}
        {imageUrl && (
          <div className="relative group mb-10">
            <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-pink-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#16161a] border border-white/10 rounded-4xl p-4 md:p-8 shadow-2xl">
              <Image
                src={imageUrl}
                alt="Dev Wrapped 2025"
                width={900}
                height={1300}
                className="w-full h-auto rounded-xl"
                unoptimized
                priority
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="w-full max-w-md flex flex-col gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-3 w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all transform hover:-translate-y-1 shadow-xl cursor-pointer"
          >
            <svg
              className="w-6 h-6"
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

          <div className="relative w-full">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center justify-center gap-3 w-full py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
            >
              <svg
                className="w-6 h-6"
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
              Share Results
              <svg
                className={`w-5 h-5 transition-transform ${
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

            {showShareMenu && (
              <div className="absolute bottom-full mb-4 left-0 right-0 bg-[#16161a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                <button
                  onClick={() => {
                    handleTwitterShare();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition-colors text-white border-b border-white/5 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="font-semibold">Share on X (Twitter)</span>
                </button>
                <button
                  onClick={() => {
                    handleLinkedInShare();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition-colors text-white border-b border-white/5 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                  </svg>
                  <span className="font-semibold">Share on LinkedIn</span>
                </button>
                <button
                  onClick={() => {
                    handleShareImage();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition-colors text-white cursor-pointer"
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
                  <span className="font-semibold">Other Apps</span>
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 opacity-60 hover:opacity-100 transition-opacity flex justify-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
