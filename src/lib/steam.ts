export function isSteamId64(input: string): boolean {
  return /^7656119\d{10}$/.test(input.trim());
}

export async function resolveVanityUrl(vanityUrl: string): Promise<string | null> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(vanityUrl)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.response?.success === 1) {
      return data.response.steamid as string;
    }
  } catch {
    return null;
  }
  return null;
}

export type ParsedInput =
  | { type: 'steamId64'; value: string }
  | { type: 'vanityUrl'; value: string }
  | { type: 'unknown'; value: string };

export function parseInput(input: string): ParsedInput {
  const trimmed = input.trim();

  if (isSteamId64(trimmed)) {
    return { type: 'steamId64', value: trimmed };
  }

  const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d+)/);
  if (profileMatch) {
    return { type: 'steamId64', value: profileMatch[1] };
  }

  const vanityMatch = trimmed.match(/steamcommunity\.com\/id\/([^/?#\s]+)/);
  if (vanityMatch) {
    return { type: 'vanityUrl', value: vanityMatch[1] };
  }

  return { type: 'unknown', value: trimmed };
}

const STEAM_API = 'https://api.steampowered.com';
const CS2_APP_ID = 730;

export interface SteamAccountStats {
  visibilityState: number;
  createdAt: number | null;
  cs2TotalHours: number | null;
  cs2RecentHours: number | null;
  cs2AchievementsUnlocked: number | null;
  cs2AchievementsTotal: number | null;
  bannedFriends: number | null;
  totalFriends: number | null;
}

export async function getSteamAccountStats(steamId64: string): Promise<SteamAccountStats | null> {
  const k = process.env.STEAM_API_KEY;
  if (!k || !steamId64) return null;

  const summaryRaw = await safeSteamFetch(
    `${STEAM_API}/ISteamUser/GetPlayerSummaries/v2/?key=${k}&steamids=${steamId64}`
  ) as { response?: { players?: Array<{ communityvisibilitystate: number; timecreated?: number }> } } | null;

  const steamPlayer = summaryRaw?.response?.players?.[0];
  if (!steamPlayer) return null;

  const isPublic = steamPlayer.communityvisibilitystate === 3;

  const [gamesRaw, achievementsRaw, friendsRaw] = await Promise.all([
    isPublic
      ? safeSteamFetch(`${STEAM_API}/IPlayerService/GetOwnedGames/v1/?key=${k}&steamid=${steamId64}&include_appinfo=0&include_played_free_games=1`)
      : Promise.resolve(null),
    isPublic
      ? safeSteamFetch(`${STEAM_API}/ISteamUserStats/GetPlayerAchievements/v1/?key=${k}&steamid=${steamId64}&appid=${CS2_APP_ID}`)
      : Promise.resolve(null),
    isPublic
      ? safeSteamFetch(`${STEAM_API}/ISteamUser/GetFriendList/v1/?key=${k}&steamid=${steamId64}&relationship=friend`)
      : Promise.resolve(null),
  ]) as [
    { response?: { games?: Array<{ appid: number; playtime_forever: number; playtime_2weeks?: number }> } } | null,
    { playerstats?: { achievements?: Array<{ achieved: number }> } } | null,
    { friendslist?: { friends?: Array<{ steamid: string }> } } | null,
  ];

  const cs2Game = gamesRaw?.response?.games?.find(g => g.appid === CS2_APP_ID) ?? null;
  const achievements = achievementsRaw?.playerstats?.achievements ?? null;
  const friends = friendsRaw?.friendslist?.friends ?? null;

  let bannedFriends: number | null = null;
  if (friends && friends.length > 0) {
    bannedFriends = 0;
    for (const ids of chunkArray(friends.map(f => f.steamid), 100)) {
      const bansRaw = await safeSteamFetch(
        `${STEAM_API}/ISteamUser/GetPlayerBans/v1/?key=${k}&steamids=${ids.join(',')}`
      ) as { players?: Array<{ VACBanned: boolean; NumberOfGameBans: number }> } | null;
      bannedFriends += (bansRaw?.players ?? []).filter(p => p.VACBanned || p.NumberOfGameBans > 0).length;
    }
  }

  return {
    visibilityState: steamPlayer.communityvisibilitystate,
    createdAt: steamPlayer.timecreated ?? null,
    cs2TotalHours: cs2Game ? Math.round(cs2Game.playtime_forever / 60) : null,
    cs2RecentHours: cs2Game?.playtime_2weeks != null ? Math.round(cs2Game.playtime_2weeks / 60) : null,
    cs2AchievementsUnlocked: achievements ? achievements.filter(a => a.achieved === 1).length : null,
    cs2AchievementsTotal: achievements ? achievements.length : null,
    bannedFriends,
    totalFriends: friends ? friends.length : null,
  };
}

async function safeSteamFetch(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
