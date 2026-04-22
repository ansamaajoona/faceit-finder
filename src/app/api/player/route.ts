import { NextRequest, NextResponse } from 'next/server';
import { getPlayerBySteamId, getPlayerByNickname, getPlayerBans } from '@/lib/faceit';
import { isSteamId64, resolveVanityUrl, parseInput, getSteamAccountStats } from '@/lib/steam';
import type { FaceitPlayer } from '@/types/faceit';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')?.trim();

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const parsed = parseInput(query);
    let steamId: string | null = null;

    if (parsed.type === 'steamId64') {
      steamId = parsed.value;
    } else {
      steamId = await resolveVanityUrl(parsed.value);
    }

    if (steamId && isSteamId64(steamId)) {
      const result = await getPlayerBySteamId(steamId);
      if (result) {
        const p = (result as { player: FaceitPlayer }).player;
        const resolvedSteamId = p.steam_id_64 ?? p.platforms?.steam ?? steamId;
        const [steam, bans] = await Promise.all([
          getSteamAccountStats(resolvedSteamId),
          getPlayerBans(p.player_id),
        ]);
        return NextResponse.json({ ...result, foundBy: 'steam', steam, bans });
      }
    }

    const player = await getPlayerByNickname(query);
    if (player) {
      const p = player as FaceitPlayer;
      const game = p.games?.cs2 ? 'cs2' : p.games?.csgo ? 'csgo' : 'cs2';
      const resolvedSteamId = p.steam_id_64 ?? p.platforms?.steam ?? '';
      const [steam, bans] = await Promise.all([
        resolvedSteamId ? getSteamAccountStats(resolvedSteamId) : Promise.resolve(null),
        getPlayerBans(p.player_id),
      ]);
      return NextResponse.json({ player, game, foundBy: 'nickname', steam, bans });
    }

    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  } catch (error) {
    console.error('Player lookup error:', error);
    return NextResponse.json({ error: 'Failed to look up player' }, { status: 500 });
  }
}
