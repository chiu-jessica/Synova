import Sidebar from "@/components/Sidebar";
import PatientCard from "@/components/PatientCard";
import { getPatientsForCurrentPhysician } from "@/lib/patients";
import { getCurrentUser } from "@/lib/current-user";

export default async function PastPatientsPage() {
  const [user, patients] = await Promise.all([
    getCurrentUser(),
    getPatientsForCurrentPhysician(),
  ]);

  return (
    <div className="flex">
      <Sidebar physicianName={user?.name} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-medium mb-6">Past patients</h1>
        {patients.length === 0 ? (
          <p className="text-sm text-gray-500">No patients yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patients.map((p) => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
