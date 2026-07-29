"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, Users, Atom } from "lucide-react";

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
    <aside className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col p-4 gap-6 min-h-screen">
      <div className="flex items-center gap-2 px-1">
        <Atom className="text-teal" size={20} />
        <span className="font-medium text-[16px]">Synova</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm ${
                active
                  ? "bg-teal-light text-teal font-medium"
                  : "text-gray-600 hover:bg-gray-50"
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
        className="mt-auto flex items-center gap-2.5 px-2.5 py-2 border-t border-gray-200 pt-4"
      >
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium shrink-0">
          {initials}
        </div>
        <span className="text-sm text-gray-600 truncate">{physicianName}</span>
      </Link>
    </aside>
  );
}
