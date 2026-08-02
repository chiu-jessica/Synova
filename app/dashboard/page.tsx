import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import UploadPanel from "@/components/UploadPanel";
import PatientCard from "@/components/PatientCard";
import { getPatientsForCurrentPhysician } from "@/lib/patients";
import { getCurrentUser } from "@/lib/current-user";
import { ScanEye } from "lucide-react";

export default async function DashboardPage() {
  const [user, patients] = await Promise.all([
    getCurrentUser(),
    getPatientsForCurrentPhysician(),
  ]);
  const recent = patients.slice(0, 4);

  return (
    <div className="flex">
      <Sidebar physicianName={user?.name} />
      <main className="flex-1 p-8 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-medium">
            {user ? `Welcome back, ${user.name}` : "Welcome back"}
          </h1>
          <p className="text-sm text-muted mt-1">
            Upload a scan, or pick up where you left off.
          </p>
        </header>

        <UploadPanel />

        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-medium">Recent patients</h2>
            {patients.length > 0 && (
              <span className="text-xs font-medium text-teal-deep bg-teal-light px-2 py-0.5 rounded-pill">
                {patients.length}
              </span>
            )}
          </div>
          {patients.length > recent.length && (
            <Link
              href="/dashboard/patients"
              className="text-xs font-medium text-teal-deep hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="rounded-card bg-white border border-black/5 px-6 py-10 text-center">
            <span className="w-12 h-12 rounded-full bg-teal-light text-teal flex items-center justify-center mx-auto mb-3">
              <ScanEye size={22} />
            </span>
            <p className="text-sm font-medium mb-1">No patients yet</p>
            <p className="text-xs text-muted">
              Upload an MRI scan above to see your first analysis here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recent.map((p) => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
