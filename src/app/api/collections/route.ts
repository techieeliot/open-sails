import { fetchMiningMetrics } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    // Simulate fetching mining data
    const data = await fetchMiningMetrics();
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
