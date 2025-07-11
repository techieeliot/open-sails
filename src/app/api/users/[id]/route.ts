import { NextRequest } from 'next/server';
import { getUserById } from '../utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    const userId = Number(searchParams.get('id'));
    if (isNaN(userId)) {
      return Response.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await getUserById(userId);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch user: ' + JSON.stringify(error) },
      { status: 500 },
    );
  }
}
