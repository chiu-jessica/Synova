import Sidebar from "@/components/Sidebar";
import PatientCard from "@/components/PatientCard";
import { getPatientsForCurrentPhysician } from "@/lib/patients";
import { getCurrentUser } from "@/lib/current-user";
import { Users } from "lucide-react";

export default async function PastPatientsPage() {
  const [user, patients] = await Promise.all([
    getCurrentUser(),
    getPatientsForCurrentPhysician(),
  ]);

  return (
    <div className="flex">
      <Sidebar physicianName={user?.name} />
      <main className="flex-1 p-8 max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-medium">Past patients</h1>
            {patients.length > 0 && (
              <span className="text-xs font-medium text-teal-deep bg-teal-light px-2 py-0.5 rounded-pill">
                {patients.length}
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-1">
            Every scan you&apos;ve analysed, newest first.
          </p>
        </header>

        {patients.length === 0 ? (
          <div className="rounded-card bg-white border border-black/5 px-6 py-10 text-center">
            <span className="w-12 h-12 rounded-full bg-teal-light text-teal flex items-center justify-center mx-auto mb-3">
              <Users size={22} />
            </span>
            <p className="text-sm font-medium mb-1">No patients yet</p>
            <p className="text-xs text-muted">
              Analysed scans will be listed here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p) => (
              <PatientCard key={p.id} patient={p} deletable />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
