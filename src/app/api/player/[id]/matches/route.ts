import { NextRequest, NextResponse } from 'next/server';
import { getPlayerMatches, getMatchEnrichment } from '@/lib/faceit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const game = request.nextUrl.searchParams.get('game') || 'cs2';
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '20'), 50);

  let matches = await getPlayerMatches(id, game, limit) as { items?: { match_id: string }[] } | null;

  if (!matches && game === 'cs2') {
    matches = await getPlayerMatches(id, 'csgo', limit) as { items?: { match_id: string }[] } | null;
  }

  if (!matches) {
    return NextResponse.json({ error: 'Matches not found' }, { status: 404 });
  }

  const enrichedItems = await Promise.all(
    (matches.items ?? []).map(async (match) => {
      const { map_name, player_stats } = await getMatchEnrichment(match.match_id, id);
      return { ...match, map_name, player_stats };
    })
  );

  return NextResponse.json({ ...matches, items: enrichedItems });
}
