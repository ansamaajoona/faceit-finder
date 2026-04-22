'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Cell,
} from 'recharts';
import type { FaceitMatchHistory, FaceitLifetimeStats } from '@/types/faceit';
import type { MatchEnrichment } from '@/lib/faceit';
import { mapDisplayName } from '@/lib/maps';

type MatchWithStats = FaceitMatchHistory['items'][number] & {
  map_name?: string | null;
  player_stats?: MatchEnrichment['player_stats'];
};

interface StatsChartsProps {
  matches?: FaceitMatchHistory & { items: MatchWithStats[] };
  stats?: FaceitLifetimeStats;
  playerId: string;
}

const GRID_COLOR = '#2A2A35';
const TEXT_COLOR = '#8B8B9A';
const ORANGE = '#FF5500';
const GREEN = '#4ade80';
const RED = '#f87171';

function tooltipStyle() {
  return {
    contentStyle: {
      backgroundColor: '#1A1A1F',
      border: '1px solid #2A2A35',
      borderRadius: '12px',
      color: '#fff',
      fontSize: 12,
    },
    labelStyle: { color: '#8B8B9A' },
    itemStyle: { color: '#fff' },
    cursor: { fill: 'rgba(255,85,0,0.07)' },
  };
}

interface MatchDataPoint {
  idx: number;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  won: boolean;
  teamName: string;
  mapName: string;
  date: string;
}

function MatchTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MatchDataPoint }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  const title = [d.teamName, d.mapName].filter(Boolean).join(' · ');

  return (
    <div style={{ backgroundColor: '#1A1A1F', border: '1px solid #2A2A35', borderRadius: 12, padding: '10px 14px', fontSize: 12, minWidth: 160 }}>
      {title && <div style={{ color: '#8B8B9A', marginBottom: 6 }}>{title}</div>}
      {d.date && <div style={{ color: '#5A5A6A', marginBottom: 8, fontSize: 11 }}>{d.date}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginBottom: 6 }}>
        <span style={{ color: '#8B8B9A' }}>K/D</span>
        <span style={{ color: d.kd >= 1 ? '#4ade80' : '#f87171', fontWeight: 700 }}>{d.kd.toFixed(2)}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
        <span style={{ color: '#8B8B9A' }}>K / A / D</span>
        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: '#4ade80' }}>{d.kills}</span>
          <span style={{ color: '#5A5A6A', margin: '0 2px' }}>/</span>
          <span style={{ color: '#8B8B9A' }}>{d.assists}</span>
          <span style={{ color: '#5A5A6A', margin: '0 2px' }}>/</span>
          <span style={{ color: '#f87171' }}>{d.deaths}</span>
        </span>
      </div>
    </div>
  );
}

function MatchPerformanceChart({ matches, playerId }: { matches: MatchWithStats[]; playerId: string }) {
  const data = [...matches]
    .reverse()
    .filter(m => m.player_stats)
    .map((m, i) => {
      const faction = m.teams.faction1.players.some(p => p.player_id === playerId)
        ? 'faction1'
        : 'faction2';
      const won = m.results?.winner === faction;
      const ts = m.finished_at ?? m.started_at;
      const date = ts ? new Date(ts * 1000).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      return {
        idx: i + 1,
        kills: m.player_stats!.kills,
        deaths: m.player_stats!.deaths,
        assists: m.player_stats!.assists,
        kd: parseFloat(m.player_stats!.kd),
        won,
        teamName: m.teams[faction]?.nickname ?? '',
        mapName: m.map_name ? mapDisplayName(m.map_name) : '',
        date,
      };
    });

  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-faceit-muted uppercase tracking-wide mb-3">
        Match Performance
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="idx"
            tick={{ fill: TEXT_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Match', position: 'insideBottom', offset: 0, fill: TEXT_COLOR, fontSize: 11 }}
          />
          <YAxis
            yAxisId="kills"
            tick={{ fill: TEXT_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="kd"
            orientation="right"
            tick={{ fill: TEXT_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={[0, 'auto']}
          />
          <Tooltip content={<MatchTooltip />} cursor={{ fill: 'rgba(255,85,0,0.07)' }} />
          <ReferenceLine yAxisId="kd" y={1} stroke={ORANGE} strokeDasharray="4 4" strokeOpacity={0.5} />

          <Bar yAxisId="kills" dataKey="kills" name="Kills" maxBarSize={18} radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.won ? GREEN : RED} fillOpacity={0.85} />
            ))}
          </Bar>

          <Bar yAxisId="kills" dataKey="deaths" name="Deaths" maxBarSize={18} radius={[3, 3, 0, 0]} fill="#5A5A6A" fillOpacity={0.5} />

          <Line
            yAxisId="kd"
            type="monotone"
            dataKey="kd"
            name="K/D"
            stroke={ORANGE}
            strokeWidth={2}
            dot={{ r: 3, fill: ORANGE, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 justify-center">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" /> Kills (W)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Kills (L)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-500 inline-block" /> Deaths</span>
        <span className="flex items-center gap-1"><span className="w-8 border-t-2 border-faceit-orange border-dashed inline-block" /> K/D 1.0</span>
      </div>
    </div>
  );
}

function HsChart({ matches }: { matches: MatchWithStats[] }) {
  const data = [...matches]
    .reverse()
    .filter(m => m.player_stats)
    .map((m, i) => {
      const ts = m.finished_at ?? m.started_at;
      const date = ts ? new Date(ts * 1000).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      return {
        idx: i + 1,
        hs: parseFloat(m.player_stats!.hs_pct),
        mapName: m.map_name ? mapDisplayName(m.map_name) : '',
        date,
      };
    });

  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-faceit-muted uppercase tracking-wide mb-3">
        Headshot % per Match
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="idx" tick={{ fill: TEXT_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: TEXT_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip
            {...tooltipStyle()}
            formatter={(v: unknown) => [`${typeof v === 'number' ? v : 0}%`, 'HS%']}
            labelFormatter={(_label, payload) => {
              const d = payload?.[0]?.payload;
              if (!d) return '';
              return [d.mapName, d.date].filter(Boolean).join('  ');
            }}
          />
          <ReferenceLine y={50} stroke={ORANGE} strokeDasharray="4 4" strokeOpacity={0.4} />
          <Bar dataKey="hs" name="HS%" maxBarSize={18} radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.hs >= 50 ? ORANGE : '#5A5A6A'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MapStatsChart({ stats }: { stats: FaceitLifetimeStats }) {
  const maps = (stats.segments ?? [])
    .filter(s => s.type === 'Map')
    .map(s => ({
      map: mapDisplayName(s.label),
      winRate: parseFloat(s.stats['Win Rate %'] ?? '0'),
      kd: parseFloat(s.stats['Average K/D Ratio'] ?? s.stats['K/D Ratio'] ?? '0'),
      matches: parseInt(s.stats['Matches'] ?? s.stats['Total Matches'] ?? '0', 10),
    }))
    .filter(m => m.matches >= 5)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 8);

  if (maps.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-faceit-muted uppercase tracking-wide mb-3">
        Win Rate by Map
      </h3>
      <ResponsiveContainer width="100%" height={Math.max(180, maps.length * 36)}>
        <BarChart
          data={maps}
          layout="vertical"
          margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            unit="%"
            tick={{ fill: TEXT_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="map"
            tick={{ fill: '#CCCCCC', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            {...tooltipStyle()}
            formatter={(value: unknown, name: unknown) => {
              const n = typeof value === 'number' ? value : 0;
              if (name === 'Win Rate') return [`${n.toFixed(1)}%`, String(name)];
              return [n.toFixed(2), String(name)];
            }}
          />
          <ReferenceLine x={50} stroke={ORANGE} strokeDasharray="4 4" strokeOpacity={0.5} />
          <Bar dataKey="winRate" name="Win Rate" maxBarSize={20} radius={[0, 3, 3, 0]}>
            {maps.map((m, i) => (
              <Cell key={i} fill={m.winRate >= 50 ? GREEN : RED} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function StatsCharts({ matches, stats, playerId }: StatsChartsProps) {
  const matchItems = (matches?.items ?? []) as MatchWithStats[];
  const hasMatchStats = matchItems.some(m => m.player_stats);
  const hasMapStats = (stats?.segments ?? []).some(s => s.type === 'Map');

  if (!hasMatchStats && !hasMapStats) return null;

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-semibold mb-3 text-faceit-heading">Charts</h2>
      <div className="bg-faceit-card border border-faceit-border rounded-2xl p-5 flex flex-col gap-8">
        {hasMatchStats && (
          <>
            <MatchPerformanceChart matches={matchItems} playerId={playerId} />
            <HsChart matches={matchItems} />
          </>
        )}
        {hasMapStats && stats && <MapStatsChart stats={stats} />}
      </div>
    </div>
  );
}
