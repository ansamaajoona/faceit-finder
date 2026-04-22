import { NextRequest, NextResponse } from 'next/server';
import { getPlayerStats } from '@/lib/faceit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const game = request.nextUrl.searchParams.get('game') || 'cs2';

  let stats = await getPlayerStats(id, game);

  if (!stats && game === 'cs2') {
    stats = await getPlayerStats(id, 'csgo');
  }

  if (!stats) {
    return NextResponse.json({ error: 'Stats not found' }, { status: 404 });
  }

  return NextResponse.json(stats);
}
