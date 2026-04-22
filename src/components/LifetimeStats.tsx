import clsx from 'clsx';
import type { FaceitLifetimeStats } from '@/types/faceit';

interface LifetimeStatsProps {
  stats: FaceitLifetimeStats;
}

interface MapStatRowProps {
  label: string;
  img?: string;
  stats: Record<string, string>;
}

function MapStatRow({ label, img, stats }: MapStatRowProps) {
  const kd = stats['Average K/D Ratio'] ?? stats['K/D Ratio'] ?? '—';
  const wr = stats['Win Rate %'] ?? '—';
  const matches = stats['Matches'] ?? stats['Total Matches'] ?? '—';
  const hs = stats['Average Headshots %'] ?? stats['Headshots per Match'] ?? '—';

  return (
    <div className="flex items-center gap-3 py-3 border-b border-faceit-border last:border-0">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={label} className="w-14 h-9 rounded object-cover shrink-0" />
      ) : (
        <div className="w-14 h-9 rounded bg-faceit-border flex items-center justify-center shrink-0">
          <span className="text-gray-500 text-xs">MAP</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{label}</div>
        <div className="text-orange-500 text-xs">{matches} matches</div>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-sm text-right">
        <div>
          <div className={clsx('font-semibold', parseFloat(kd) >= 1.0 ? 'text-green-400' : 'text-red-400')}>
            {kd}
          </div>
          <div className="text-gray-500 text-xs">K/D</div>
        </div>
        <div>
          <div className={clsx('font-semibold', parseFloat(wr) >= 50 ? 'text-green-400' : 'text-faceit-muted')}>
            {wr !== '—' ? `${wr}%` : '—'}
          </div>
          <div className="text-gray-500 text-xs">Win Rate</div>
        </div>
        <div>
          <div className="font-semibold text-faceit-heading">
            {hs !== '—' ? (hs.includes('%') ? hs : `${hs}%`) : '—'}
          </div>
          <div className="text-gray-500 text-xs">HS%</div>
        </div>
      </div>
    </div>
  );
}

export default function LifetimeStats({ stats }: LifetimeStatsProps) {
  const mapSegments = (stats.segments?.filter((s) => s.type === 'Map') ?? [])
    .sort((a, b) => {
      const aMatches = parseInt(a.stats['Matches'] ?? a.stats['Total Matches'] ?? '0', 10);
      const bMatches = parseInt(b.stats['Matches'] ?? b.stats['Total Matches'] ?? '0', 10);
      return bMatches - aMatches;
    });


  if (mapSegments.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-semibold mb-3 text-faceit-heading">Stats by Map</h2>
      <div className="bg-faceit-card border border-faceit-border rounded-2xl px-5 py-2">
        {mapSegments.map((seg) => (
          <MapStatRow
            key={seg.label}
            label={seg.label}
            img={seg.img_small}
            stats={seg.stats}
          />
        ))}
      </div>
    </div>
  );
}
