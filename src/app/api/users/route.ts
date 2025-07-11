import { NextRequest } from 'next/server';
import { getUsers } from './utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('id');
  try {
    const users = await getUsers();
    if (userId) {
      const user = users.find((u) => u.id === Number(userId));
      return new Response(JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(users), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json(
      { error: `Failed to fetch users: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
