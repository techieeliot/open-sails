import { getUsers } from './utils';

export async function GET(request: Request) {
  try {
    const users = await getUsers();
    return new Response(JSON.stringify(users), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
