/**
 * Landing Page - GitHub Wrapped 2025
 * Home page with login button via GitHub OAuth
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/app/components/LoginButton";

export default async function Home() {
  const session = await auth();

  // If already authenticated, redirect to wrapped
  if (session) {
    redirect("/wrapped");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-purple-900 to-violet-900">
      <main className="flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Logo and Title */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">GitHub Wrapped</h1>
          <p className="text-2xl text-purple-200 font-semibold">2025</p>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-300 max-w-2xl mb-12">
          Discover your development stats for 2025! Connect with your GitHub
          account and see your year in commits, languages, streaks, and more.
        </p>

        {/* Login Button */}
        <LoginButton />

        {/* Footer Info */}
        <div className="mt-16 text-sm text-gray-400">
          <p>Developed with Next.js, Auth.js, and the GitHub GraphQL API</p>
        </div>
      </main>
    </div>
  );
}
