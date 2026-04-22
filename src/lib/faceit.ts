const FACEIT_API_BASE = 'https://open.faceit.com/data/v4';

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function getPlayerBySteamId(
  steamId: string
): Promise<{ player: unknown; game: string } | null> {
  for (const game of ['cs2', 'csgo']) {
    try {
      const res = await fetch(
        `${FACEIT_API_BASE}/players?game=${game}&game_player_id=${steamId}`,
        { headers: getHeaders(), cache: 'no-store' }
      );
      if (res.ok) {
        const player = await res.json();
        return { player, game };
      }
    } catch {}
  }
  return null;
}

export async function getPlayerByNickname(nickname: string): Promise<unknown | null> {
  try {
    const res = await fetch(
      `${FACEIT_API_BASE}/players?nickname=${encodeURIComponent(nickname)}`,
      { headers: getHeaders(), cache: 'no-store' }
    );
    if (res.ok) return res.json();
  } catch {
    return null;
  }
  return null;
}

export async function getPlayerBans(playerId: string): Promise<import('@/types/faceit').FaceitBan[] | null> {
  try {
    const res = await fetch(`${FACEIT_API_BASE}/players/${playerId}/bans`, {
      headers: getHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.items ?? []) as import('@/types/faceit').FaceitBan[];
  } catch {
    return null;
  }
}

export async function getPlayerStats(
  playerId: string,
  game = 'cs2'
): Promise<unknown | null> {
  try {
    const res = await fetch(
      `${FACEIT_API_BASE}/players/${playerId}/stats/${game}`,
      { headers: getHeaders(), cache: 'no-store' }
    );
    if (res.ok) return res.json();
  } catch {
    return null;
  }
  return null;
}

export async function getPlayerMatches(
  playerId: string,
  game = 'cs2',
  limit = 20
): Promise<unknown | null> {
  try {
    const res = await fetch(
      `${FACEIT_API_BASE}/players/${playerId}/history?game=${game}&limit=${limit}`,
      { headers: getHeaders(), cache: 'no-store' }
    );
    if (res.ok) return res.json();
  } catch {
    return null;
  }
  return null;
}

export interface MatchEnrichment {
  map_name: string | null;
  player_stats: {
    kills: number;
    deaths: number;
    assists: number;
    kd: string;
    hs_pct: string;
    mvps: number;
    kr: string;
    triple_kills: number;
    quadro_kills: number;
    penta_kills: number;
  } | null;
}

export async function getMatchEnrichment(matchId: string, playerId: string): Promise<MatchEnrichment> {
  try {
    const res = await fetch(`${FACEIT_API_BASE}/matches/${matchId}/stats`, {
      headers: getHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return { map_name: null, player_stats: null };
    const data = await res.json();
    const round = data.rounds?.[0];
    const map_name = (round?.round_stats?.Map as string) ?? null;

    let player_stats: MatchEnrichment['player_stats'] = null;
    for (const team of round?.teams ?? []) {
      const p = team.players?.find((pl: { player_id: string }) => pl.player_id === playerId);
      if (p) {
        const s = p.player_stats ?? {};
        player_stats = {
          kills:        parseInt(s['Kills'] ?? '0', 10),
          deaths:       parseInt(s['Deaths'] ?? '0', 10),
          assists:      parseInt(s['Assists'] ?? '0', 10),
          kd:           s['K/D Ratio'] ?? '0',
          hs_pct:       s['Headshots %'] ?? '0',
          mvps:         parseInt(s['MVPs'] ?? '0', 10),
          kr:           s['K/R Ratio'] ?? '0',
          triple_kills: parseInt(s['Triple Kills'] ?? '0', 10),
          quadro_kills: parseInt(s['Quadro Kills'] ?? '0', 10),
          penta_kills:  parseInt(s['Penta Kills'] ?? '0', 10),
        };
        break;
      }
    }

    return { map_name, player_stats };
  } catch {
    return { map_name: null, player_stats: null };
  }
}
