/**
 * Landing Page - GitHub Wrapped 2025
 * Estilizada com a identidade visual do GitHub Universe '25
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/app/components/LoginButton";

export default async function Home() {
  const session = await auth();

  // Redirecionamento se já autenticado
  if (session) {
    redirect("/wrapped");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0d1117] overflow-hidden">
      {/* Efeito Nebula/Glow inspirado no Universe '25 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />

      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Badge superior (Universe Style) */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/50 px-4 py-1 text-sm text-gray-300 backdrop-blur-md">
          <span>Dev Wrapped</span>
        </div>

        {/* Logo and Title */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#f0f6fc] mb-4">
            Dev Wrapped
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">
              What have you built in 2025?
            </span>
          </h1>
        </div>

        {/* Description */}
        <p className="max-w-2xl text-lg md:text-xl text-[#8b949e] mb-12 leading-relaxed">
          Show your impact on GitHub in 2025 with a personalized summary card.
        </p>

        {/* Login Button Area */}
        <div className="flex flex-col sm:flex-row items-center gap-4 cursor-pointer">
          <LoginButton />
        </div>

        <footer className="mt-24 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-medium">
            <a
              href="https://leonardotironi.vercel.app"
              target="_blank"
              className="hover:text-blue-400 transition-colors"
            >
              Made by Leonardo Tironi
            </a>
          </div>

          <p className="max-w-xs text-[10px] text-gray-600 leading-tight">
            Este projeto não é afiliado ou endossado pelo GitHub Inc. GitHub e
            as marcas relacionadas são propriedades de seus respectivos donos.
          </p>
        </footer>
      </main>
    </div>
  );
}
