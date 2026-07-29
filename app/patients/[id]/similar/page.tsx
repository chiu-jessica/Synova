import { getSimilarPatients } from "@/lib/patients";
import PatientCard from "@/components/PatientCard";

export default async function SimilarPatientsPage({
  params,
}: {
  params: { id: string };
}) {
  const similar = await getSimilarPatients(params.id);

  if (similar.length === 0) {
    return <p className="text-sm text-gray-500">No similar patients found yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {similar.map((p) => (
        <PatientCard key={p.id} patient={p} />
      ))}
    </div>
  );
}
