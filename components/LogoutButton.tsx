"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

// Split out so the profile page can stay a server component and read the
// signed-in user directly.
export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-600"
    >
      <LogOut size={16} /> Log out
    </button>
  );
}
