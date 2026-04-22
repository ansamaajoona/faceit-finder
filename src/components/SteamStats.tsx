import clsx from 'clsx';
import type { SteamAccountStats } from '@/lib/steam';

interface SteamStatsProps {
  steam: SteamAccountStats;
  cs2ActivatedAt?: number;
  steamId?: string;
}

function Row({ label, value, accent }: { label: string; value: string; accent?: 'red' | 'green' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-faceit-border last:border-0">
      <span className="text-faceit-muted text-sm">{label}</span>
      <span
        className={clsx('text-sm font-semibold', {
          'text-red-400': accent === 'red',
          'text-green-400': accent === 'green',
          'text-white': !accent,
        })}
      >
        {value}
      </span>
    </div>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function visibilityLabel(state: number): string {
  if (state === 3) return 'Public';
  if (state === 2) return 'Friends Only';
  return 'Private';
}

export default function SteamStats({ steam, cs2ActivatedAt, steamId }: SteamStatsProps) {
  const isPublic = steam.visibilityState === 3;

  const accountStatus = visibilityLabel(steam.visibilityState);
  const accountCreated = steam.createdAt ? formatDate(steam.createdAt) : 'Unknown';

  const playsCs2Since =
    cs2ActivatedAt
      ? formatDate(cs2ActivatedAt)
      : isPublic
      ? 'Unknown'
      : 'Private';

  const totalHours =
    steam.cs2TotalHours != null
      ? `${steam.cs2TotalHours.toLocaleString()} h`
      : 'Private';

  const recentHours =
    steam.cs2RecentHours != null
      ? `${steam.cs2RecentHours.toLocaleString()} h`
      : 'Private';

  const achievements =
    steam.cs2AchievementsUnlocked != null && steam.cs2AchievementsTotal != null
      ? `${steam.cs2AchievementsUnlocked}/${steam.cs2AchievementsTotal}`
      : 'Private';

  const bannedFriendsValue =
    steam.bannedFriends != null && steam.totalFriends != null
      ? `${steam.bannedFriends}/${steam.totalFriends} (${
          steam.totalFriends > 0
            ? Math.round((steam.bannedFriends / steam.totalFriends) * 100)
            : 0
        }%)`
      : 'Private';

  const bannedAccent =
    steam.bannedFriends != null && steam.bannedFriends > 0 ? 'red' : undefined;

  const steamUrl = steamId ? `https://steamcommunity.com/profiles/${steamId}` : null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold text-faceit-heading">Steam Account</h2>
        {steamUrl && (
          <a
            href={steamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-200 hover:text-gray-100 transition-colors border border-gray-200/30 hover:border-gray-100 rounded-lg px-3 py-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            STEAM
          </a>
        )}
      </div>
      <div className="bg-faceit-card border border-faceit-border rounded-2xl px-5 py-1">
        <Row
          label="Account status"
          value={accountStatus}
          accent={isPublic ? 'green' : undefined}
        />
        <Row label="Account created" value={accountCreated} />
        <Row label="Plays CS2 since" value={playsCs2Since} />
        <Row label="CS total hours" value={totalHours} />
        <Row label="CS2 last 2 weeks" value={recentHours} />
        <Row label="CS2 achievements" value={achievements} />
        <Row label="Banned friends" value={bannedFriendsValue} accent={bannedAccent} />
      </div>
    </div>
  );
}
