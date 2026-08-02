import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import PatientTabs from "@/components/PatientTabs";
import { getPatientById } from "@/lib/patients";
import { getCurrentUser } from "@/lib/current-user";
import { ArrowLeft } from "lucide-react";

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
          className="flex items-center gap-1.5 text-xs text-teal-deep font-medium mb-4 w-fit hover:underline"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="mb-6 bg-teal-light rounded-card px-5 py-4">
          <p className="text-xs text-teal-deep font-medium mb-0.5">Patient ID</p>
          <h1 className="text-xl font-medium">
            {patient?.patientIdentifier ?? params.id}
          </h1>
        </div>

        <PatientTabs patientId={params.id} />

        {children}
      </main>
    </div>
  );
}
