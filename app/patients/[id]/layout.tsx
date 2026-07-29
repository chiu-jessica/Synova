import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getPatientById } from "@/lib/patients";
import { getCurrentUser } from "@/lib/current-user";
import { ArrowLeft } from "lucide-react";

const tabs = [
  { href: "diagnosis", label: "Possible diagnosis" },
  { href: "heatmap", label: "Tumor heatmap" },
  { href: "similar", label: "Similar patients" },
  { href: "viewer", label: "Interactive viewer" },
];

export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const [user, patient] = await Promise.all([
    getCurrentUser(),
    getPatientById(params.id),
  ]);

  return (
    <div className="flex">
      <Sidebar physicianName={user?.name} />
      <main className="flex-1 p-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 w-fit"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-0.5">Patient ID</p>
          <h1 className="text-xl font-medium">
            {patient?.patientIdentifier ?? params.id} · T1c axial
          </h1>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={`/patients/${params.id}/${t.href}`}
              className="px-3 py-2 text-sm text-gray-600 hover:text-teal border-b-2 border-transparent hover:border-teal -mb-px"
            >
              {t.label}
            </Link>
          ))}
        </div>

        {children}
      </main>
    </div>
  );
}
