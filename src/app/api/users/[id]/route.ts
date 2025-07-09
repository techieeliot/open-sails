import { getUserById } from '../utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = Number(params.id);
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
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
