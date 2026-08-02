"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "diagnosis", label: "Possible diagnosis" },
  { href: "heatmap", label: "Tumor heatmap" },
  { href: "similar", label: "Similar patients" },
  { href: "viewer", label: "Interactive viewer" },
];

// A client component purely so it can read the pathname — the patient layout
// around it stays a server component and keeps awaiting its Supabase query.
export default function PatientTabs({ patientId }: { patientId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mb-6">
      {tabs.map((t) => {
        const href = `/patients/${patientId}/${t.href}`;
        const active = pathname === href;

        return (
          <Link
            key={t.href}
            href={href}
            // Marks the current tab for screen readers, so the state is not
            // carried by colour alone.
            aria-current={active ? "page" : undefined}
            className={`px-4 py-2 text-sm rounded-pill border-2 transition-colors ${
              active
                ? "bg-teal-dark border-teal-dark text-white font-medium"
                : "bg-white border-teal-light text-gray-700 hover:border-teal hover:text-teal-deep"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
