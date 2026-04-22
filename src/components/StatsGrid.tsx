import clsx from 'clsx';
import type { FaceitLifetimeStats } from '@/types/faceit';

interface StatsGridProps {
  stats: FaceitLifetimeStats;
  recentResults?: string[];
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
}

function StatCard({ label, value, sub, positive, negative }: StatCardProps) {
  return (
    <div className="bg-faceit-card border border-faceit-border rounded-xl p-4 flex flex-col gap-1">
      <span className="text-faceit-muted text-xs uppercase tracking-wide">{label}</span>
      <span className={clsx('text-2xl font-bold', positive ? 'text-green-400' : negative ? 'text-red-400' : 'text-white')}>
        {value}
      </span>
      {sub && <span className="text-gray-500 text-xs">{sub}</span>}
    </div>
  );
}

function RecentResults({ results }: { results: string[] }) {
  return (
    <div className="bg-faceit-card border border-faceit-border rounded-xl p-4 h-full">
      <span className="text-faceit-muted text-xs uppercase tracking-wide block mb-2">Recent Results</span>
      <div className="flex gap-1.5 flex-wrap">
        {results.slice(0, 10).map((r, i) => (
          <span
            key={i}
            className={clsx(
              'w-7 h-7 rounded flex items-center justify-center text-xs font-bold',
              r === '1'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            )}
          >
            {r === '1' ? 'W' : 'L'}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StatsGrid({ stats, recentResults }: StatsGridProps) {
  const lt = stats.lifetime;

  const kd = lt['Average K/D Ratio'] ?? lt['K/D Ratio'] ?? '—';
  const hs = lt['Average Headshots %'] ?? lt['Total Headshots %'] ?? '—';
  const matches = lt['Matches'] ?? '—';
  const wins = lt['Wins'] ?? '—';
  const winRate = lt['Win Rate %'] ?? '—';
  const longestStreak = lt['Longest Win Streak'] ?? '—';
  const currentStreak = lt['Current Win Streak'] ?? '—';

  const recentRes = recentResults ?? lt['Recent Results'] ?? [];

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-semibold mb-3 text-faceit-heading">Lifetime Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="K/D Ratio" value={kd} negative={parseFloat(kd) < 1.0} positive={parseFloat(kd) >= 1.5}/>
        <StatCard label="Headshots" value={hs !== '—' ? `${hs}%` : '—'} negative={parseFloat(hs) < 30} positive={parseFloat(hs) >= 50} />
        <StatCard label="Matches" value={Number(matches).toLocaleString()} />
        <StatCard label="Wins" value={Number(wins).toLocaleString()} />
        <StatCard label="Win Rate" value={winRate !== '—' ? `${winRate}%` : '—'} negative={parseFloat(winRate) < 40} positive={parseFloat(winRate) >= 55} />
        <StatCard label="Longest Streak" value={longestStreak} sub="consecutive wins" />
        <StatCard label="Current Streak" value={currentStreak} sub="win streak" />
        {recentRes.length > 0 && (
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <RecentResults results={recentRes} />
          </div>
        )}
      </div>
    </div>
  );
}
