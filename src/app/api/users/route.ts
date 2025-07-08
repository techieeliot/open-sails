import usersData from '@/db/users.json';

export async function GET(request: Request) {
  try {
    return new Response(JSON.stringify(usersData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
