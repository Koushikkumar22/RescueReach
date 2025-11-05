import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function IncidentDetailPage() {
  const { id } = useParams();

  const { data: incident, isLoading, error } = useQuery({
    queryKey: ["incident", id],
    queryFn: async () => {
      const res = await fetch(`/api/incidents/${id}`);
      if (!res.ok) throw new Error("Failed to fetch incident details");
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) return <p className="p-6">Loading incident details...</p>;
  if (error) return <p className="p-6 text-red-500">Failed to load incident</p>;
  if (!incident) return <p className="p-6">Incident not found</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2">{incident.type} Emergency</h1>
      <p className="text-gray-700 mb-2">
        <strong>Severity:</strong> {incident.severity}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>Status:</strong> {incident.status}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>Reported by:</strong> {incident.reportedBy}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>Location:</strong>{" "}
        {incident.address || `${incident.latitude}, ${incident.longitude}`}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>Description:</strong> {incident.description || "No details provided"}
      </p>
      {incident.photoUrl && (
        <img
          src={incident.photoUrl}
          alt="Incident photo"
          className="mt-4 rounded-md w-full max-h-96 object-cover"
        />
      )}
    </div>
  );
}
