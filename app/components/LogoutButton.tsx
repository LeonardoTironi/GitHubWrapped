"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full cursor-pointer hover:bg-red-700 transition-all"
    >
      Sign Out
    </button>
  );
}
