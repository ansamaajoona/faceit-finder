'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import SearchInput from '@/components/SearchInput';
import PlayerHeader from '@/components/PlayerHeader';
import StatsGrid from '@/components/StatsGrid';
import MatchHistory from '@/components/MatchHistory';
import LifetimeStats from '@/components/LifetimeStats';
import SteamStats from '@/components/SteamStats';
import FaceitLogo from '@/components/FaceitLogo';
import StatsCharts from '@/components/StatsCharts';
import type {
  FaceitPlayer,
  FaceitLifetimeStats,
  FaceitMatchHistory,
  FaceitBan,
  PlayerSearchResult,
} from '@/types/faceit';
import type { SteamAccountStats } from '@/lib/steam';
import nextConfig from '../../next.config';

const BASE_PATH = nextConfig.basePath;
console.log(BASE_PATH)

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-faceit-card border border-faceit-border rounded-2xl p-6 flex items-center gap-5">
        <SkeletonBlock className="w-20 h-20 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBlock className="h-7 w-48" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-2 w-40 mt-1" />
        </div>
        <div className="flex gap-4 items-center">
          <SkeletonBlock className="w-16 h-16 rounded-full" />
          <SkeletonBlock className="w-16 h-10" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <SkeletonBlock key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <SkeletonBlock className="h-64 rounded-2xl" />
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [player, setPlayer] = useState<FaceitPlayer | null>(null);
  const [game, setGame] = useState('cs2');
  const [stats, setStats] = useState<FaceitLifetimeStats | null>(null);
  const [matches, setMatches] = useState<FaceitMatchHistory | null>(null);
  const [steamStats, setSteamStats] = useState<SteamAccountStats | null>(null);
  const [bans, setBans] = useState<FaceitBan[] | null>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateUrl(searchQuery: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('q', searchQuery);
    router.replace('/' + url.search, { scroll: false });
  }

  function onUserSearch(searchQuery: string) {
    updateUrl(searchQuery);
    handleSearch(searchQuery);
  }

  async function handleSearch(searchQuery: string) {
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);
    setPlayer(null);
    setStats(null);
    setMatches(null);
    setSteamStats(null);
    setBans(null);

    try {
      const res = await fetch(`${BASE_PATH}/api/player?query=${encodeURIComponent(searchQuery)}`);
      const data: PlayerSearchResult & { error?: string } = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? 'Player not found. Try a different name or ID.');
        setIsLoading(false);
        return;
      }

      setPlayer(data.player);
      setGame(data.game);
      setSteamStats(data.steam ?? null);
      setBans(data.bans ?? null);

      const [statsRes, matchesRes] = await Promise.all([
        fetch(`${BASE_PATH}/api/player/${data.player.player_id}/stats?game=${data.game}`),
        fetch(`${BASE_PATH}/api/player/${data.player.player_id}/matches?game=${data.game}&limit=20`),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const hasResults = player !== null;

  return (
    <div className="min-h-screen bg-faceit-dark flex flex-col">
      <header
        className={clsx(
          'transition-all duration-500',
          hasResults
            ? 'py-3 sm:py-4 border-b border-faceit-border bg-faceit-dark/80 backdrop-blur-sm sticky top-0 z-10'
            : 'pt-24 pb-10'
        )}
      >
        <div className="max-w-5xl mx-auto px-4">
          {!hasResults && (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-3">
                <FaceitLogo  className="text-4xl" />
              </div>
              <p className="text-faceit-muted text-lg">
                Look up any FACEIT profile by Steam ID, Steam URL, or FACEIT nickname
              </p>
            </div>
          )}

          {hasResults ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <FaceitLogo className="shrink-0 text-base sm:text-4xl" />
              <div className="flex-1">
                <SearchInput
                  onSearch={onUserSearch}
                  isLoading={isLoading}
                  defaultValue={query}
                />
              </div>
            </div>
          ) : (
            <SearchInput onSearch={onUserSearch} isLoading={isLoading} />
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm animate-fade-in flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {isLoading && <LoadingSkeleton />}

        {!isLoading && player && (
          <div className="flex flex-col gap-6">
            <PlayerHeader
              player={player}
              game={game}
              bans={bans}
            />

            {steamStats && (
              <SteamStats
                steam={steamStats}
                cs2ActivatedAt={player.games?.cs2?.activated_at ?? player.games?.csgo?.activated_at}
                steamId={player.steam_id_64 ?? player.platforms?.steam}
              />
            )}

            {stats && (
              <StatsGrid
                stats={stats}
                recentResults={stats.lifetime?.['Recent Results']}
              />
            )}

            {matches && (
              <MatchHistory matchHistory={matches} playerId={player.player_id} />
            )}

            <StatsCharts
              matches={matches ?? undefined}
              stats={stats ?? undefined}
              playerId={player.player_id}
            />

            {stats && <LifetimeStats stats={stats} />}

          </div>
        )}
      </main>

      <footer className="border-t border-faceit-border py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-400 text-xs">
          Not affiliated with FACEIT. Inspired by{' '}
          <a
            href="https://faceitfinder.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:underline"
          >
            faceitfinder.com
          </a>
          .
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-faceit-dark flex items-center justify-center">
          <div className="text-gray-500">Loading…</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
