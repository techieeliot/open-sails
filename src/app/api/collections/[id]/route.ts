interface MockMinerResponse {
  minerId: string;
  metrics: {
    hashrate: number; // TH/s
    efficiency: number; // J/TH
    powerDraw: number; // Watts
    lastUpdated: string; // ISO timestamp
  };
  historicalData: Array<{
    timestamp: string;
    hashrate: number;
  }>;
}

export async function GET(request: Request) {
  const minerId = request.url.split("/").pop() || "defaultMiner";

  const response: MockMinerResponse = {
    minerId,
    metrics: {
      hashrate: 100, // Mock value
      efficiency: 50, // Mock value
      powerDraw: 200, // Mock value
      lastUpdated: new Date().toISOString(),
    },
    historicalData: [
      { timestamp: new Date().toISOString(), hashrate: 100 },
      { timestamp: new Date().toISOString(), hashrate: 110 },
    ],
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
}
