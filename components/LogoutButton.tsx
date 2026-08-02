"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

// Split out so the profile page can stay a server component and read the
// signed-in user directly.
export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-sm px-5 py-2 rounded-pill border-2 border-pink text-pink-deep font-medium hover:bg-pink-light"
    >
      <LogOut size={16} /> Log out
    </button>
  );
}
