import Sidebar from "@/components/Sidebar";
import UploadPanel from "@/components/UploadPanel";
import PatientCard from "@/components/PatientCard";
import { getPatientsForCurrentPhysician } from "@/lib/patients";
import { getCurrentUser } from "@/lib/current-user";

export default async function DashboardPage() {
  const [user, patients] = await Promise.all([
    getCurrentUser(),
    getPatientsForCurrentPhysician(),
  ]);
  const recent = patients.slice(0, 4);

  return (
    <div className="flex">
      <Sidebar physicianName={user?.name} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-medium mb-6">
          {user ? `Welcome back, ${user.name}` : "Welcome back"}
        </h1>

        <UploadPanel />

        <h2 className="text-sm font-medium text-gray-600 mb-3">Recent patients</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">
            No patients yet — upload an MRI scan to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recent.map((p) => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
