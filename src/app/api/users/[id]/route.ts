import usersData from '@/db/users.json';

export async function GET(request: Request) {
  const userId = request.url.split('/').pop() || 0;
  try {
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (userId === 'route' || isNaN(Number(userId))) {
      return Response.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = usersData.find((u) => u.id === Number(userId));
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
