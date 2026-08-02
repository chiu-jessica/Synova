"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, Users } from "lucide-react";
import Logo from "@/components/Logo";

const navItems = [
  { href: "/dashboard", label: "Upload MRI", icon: Upload },
  { href: "/dashboard/patients", label: "Past patients", icon: Users },
];

export default function Sidebar({
  physicianName = "Account",
}: {
  physicianName?: string;
}) {
  const initials =
    physicianName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r-2 border-teal-light flex flex-col p-4 gap-6 min-h-screen">
      <div className="px-1">
        <Logo size={26} showName nameClass="font-medium text-[16px] tracking-wide" />
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-pill text-sm ${
                active
                  ? "bg-teal-dark text-white font-medium"
                  : "text-gray-700 hover:bg-teal-light hover:text-teal-deep"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/profile"
        className="mt-auto flex items-center gap-2.5 px-2.5 py-2 border-t-2 border-teal-light pt-4"
      >
        <div className="w-8 h-8 rounded-full bg-teal-light text-teal-deep flex items-center justify-center text-xs font-medium shrink-0">
          {initials}
        </div>
        <span className="text-sm text-gray-600 truncate">{physicianName}</span>
      </Link>
    </aside>
  );
}
