import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "@/services/api/health";

export default function Health() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchOnWindowFocus: false
  });

  if (isLoading) return <p>Ładowanie…</p>;
  if (error) return <p style={{ color: "crimson" }}>Error</p>;

  return (
    <div>
      <h1>API Health</h1>
      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? "Odświeżanie…" : "Odśwież"}
      </button>
      <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 6, overflow: "auto" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
