export async function GET(request: Request) {
  try {
    // Simulate fetching mining data
    const data = [
      {
        id: '12345',
        amount: 1000,
      },
      {
        id: '67890',
        amount: 2000,
      },
    ];
    console.log('Fetched mining data:', data);
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
