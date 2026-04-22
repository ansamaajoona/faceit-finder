import clsx from 'clsx';
import type { FaceitMatch, FaceitMatchHistory } from '@/types/faceit';
import type { MatchEnrichment } from '@/lib/faceit';
import { mapDisplayName } from '@/lib/maps';

interface MatchHistoryProps {
  matchHistory: FaceitMatchHistory;
  playerId: string;
}

type MatchWithMap = FaceitMatch & {
  map_name?: string | null;
  player_stats?: MatchEnrichment['player_stats'];
};

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp * 1000;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

function formatDate(timestamp: number): string {
  const a = new Date(timestamp * 1000);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const date = a.getDate();
  const hour = a.getHours();
  const min = a.getMinutes();
  const sec = a.getSeconds();
  const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

function formatDuration(start: number, end: number): string {
  const secs = end - start;
  const m = Math.floor(secs / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}


function MatchRow({ match, playerId }: { match: MatchWithMap; playerId: string }) {
  const playerFaction = match.teams.faction1.players.some((p) => p.player_id === playerId)
    ? 'faction1'
    : match.teams.faction2.players.some((p) => p.player_id === playerId)
    ? 'faction2'
    : null;

  const won = playerFaction !== null && match.results?.winner === playerFaction;
  const lost = playerFaction !== null && match.results?.winner !== playerFaction;

  const score1 = match.results?.score?.faction1 ?? 0;
  const score2 = match.results?.score?.faction2 ?? 0;

  const myScore = playerFaction === 'faction1' ? score1 : score2;
  const oppScore = playerFaction === 'faction1' ? score2 : score1;

  const faceitUrl = match.faceit_url?.replace('{lang}', 'en') ?? '#';

  return (
      <div onClick={() => window.open(faceitUrl)}className="flex items-center gap-3 py-3 border-b border-faceit-border last:border-0 group hover:bg-faceit-card-hover -mx-5 px-5 transition-colors rounded-lg hover:cursor-pointer">
        <div
          className={clsx(
            'w-8 text-center text-xs font-bold py-1 rounded shrink-0',
            won
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : lost
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-faceit-border text-faceit-muted'
          )}
        >
          {won ? 'W' : lost ? 'L' : '?'}
        </div>

        <div className="text-center shrink-0 w-14">
          <div className="font-bold text-sm">
            <span className={clsx(won ? 'text-green-400' : lost ? 'text-red-400' : 'text-white')}>
              {myScore}
            </span>
            <span className="text-gray-500 mx-0.5">:</span>
            <span className="text-white">{oppScore}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-faceit-heading">
            {playerFaction && match.teams[playerFaction].nickname}
          </div>
          <div className="flex items-center gap-2 text-xs text-faceit-muted">
            {match.map_name && (
              <span className="text-orange-500 font-medium">
                {mapDisplayName(match.map_name)}
              </span>
            )}
            {match.map_name && <span className="text-faceit-subtle">·</span>}
            <span className="hidden sm:block text-gray-500" title={formatDate(match.finished_at)}>
              {match.finished_at
                ? `${formatTimeAgo(match.finished_at)} · ${formatDuration(match.started_at, match.finished_at)}`
                : formatTimeAgo(match.started_at)}
            </span>
          </div>
        </div>

        {match.player_stats && (
          <div className="flex items-center gap-4 shrink-0 text-right">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">K / A / D</div>
              <div className="text-sm font-semibold text-white tabular-nums">
                <span className="text-green-400">{match.player_stats.kills}</span>
                <span className="text-gray-500 mx-0.5">/</span>
                <span className="text-faceit-muted">{match.player_stats.assists}</span>
                <span className="text-gray-500 mx-0.5">/</span>
                <span className="text-red-400">{match.player_stats.deaths}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">K/D</div>
              <div className={clsx('text-sm font-bold tabular-nums', parseFloat(match.player_stats.kd) >= 1 ? 'text-green-400' : 'text-red-400')}>
                {parseFloat(match.player_stats.kd).toFixed(2)}
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-xs text-gray-500 mb-0.5">HS%</div>
              <div className="text-sm font-semibold text-faceit-heading tabular-nums">
                {match.player_stats.hs_pct}%
              </div>
            </div>
          </div>
        )}

        <a
          href={faceitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-gray-500 hover:text-orange-500 opacity-0 group-hover:opacity-100 hidden sm:group-hover:block transition-all"
          title="View on FACEIT"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    );
  }

  export default function MatchHistory({ matchHistory, playerId }: MatchHistoryProps) {
    const matches = (matchHistory.items ?? []) as MatchWithMap[];

    if (matches.length === 0) {
      return (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold mb-3 text-faceit-heading">Recent matches</h2>
          <div className="bg-faceit-card border border-faceit-border rounded-2xl p-8 text-center text-gray-500">
            No recent matches found.
          </div>
        </div>
      );
    }

    const wins = matches.filter(
      (m) =>
        m.teams.faction1.players.some((p) => p.player_id === playerId)
          ? m.results?.winner === 'faction1'
          : m.results?.winner === 'faction2'
    ).length;

    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-200">{`Last ${matches.length} matches`}</h2>
          <span className="text-sm text-gray-500">
            <span className="text-green-400 font-semibold">{wins}W</span>
            {' / '}
            <span className="text-red-400 font-semibold">{matches.length - wins}L</span>
            {' '}
          </span>
        </div>

        <div className="bg-faceit-card border border-faceit-border rounded-2xl px-5 py-1">
          {matches.map((match) => (
            <MatchRow key={match.match_id} match={match} playerId={playerId} />
          ))}
        </div>
      </div>
  );
}
