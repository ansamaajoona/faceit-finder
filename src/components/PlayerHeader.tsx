import Image from 'next/image';
import FaceitLevel from './FaceitLevel';
import type { FaceitPlayer, FaceitBan } from '@/types/faceit';
import clsx from 'clsx';

interface PlayerHeaderProps {
  player: FaceitPlayer;
  game: string;
  bans?: FaceitBan[] | null;
}

function isBanActive(ban: FaceitBan): boolean {
  if (!ban.ends_at) return true;
  return new Date(ban.ends_at) > new Date();
}

function formatBanDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function banLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const ELO_THRESHOLDS = [500, 750, 900, 1050, 1200, 1350, 1530, 1750, 2000];

export default function PlayerHeader({ player, game, bans }: PlayerHeaderProps) {
  const gameInfo = player.games?.[game as 'cs2' | 'csgo'] ?? player.games?.cs2 ?? player.games?.csgo;
  const elo = gameInfo?.faceit_elo ?? 0;
  const level = gameInfo?.skill_level ?? 1;

  const profileUrl = player.faceit_url?.replace('{lang}', 'en') ?? '#';
  const memberSince = player.activated_at ? new Date(player.activated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }) : 'Unknown';

  const hasBans = bans && bans.length > 0;
  const hasActiveBan = bans?.some(isBanActive) ?? false;
  const activeBans = bans?.filter(isBanActive) ?? [];
  const expiredBans = bans?.filter(b => !isBanActive(b)) ?? [];

  return (
    <div onClick={() => window.open(profileUrl, "_blank")} className="bg-faceit-card border border-faceit-border rounded-2xl p-6 animate-fade-in hover:cursor-pointer hover:bg-faceit-card-hover transition-colors">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {player.avatar ? (
            <Image
              src={player.avatar}
              alt={player.nickname}
              width={80}
              height={80}
              className="rounded-xl object-cover"
              unoptimized
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-faceit-border flex items-center justify-center text-3xl text-gray-500">
              {player.nickname?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{player.nickname}</h1>
            {player.verified && (
              <span className="text-orange-500 text-xs font-semibold bg-orange-500/10 border border-orange-500/30 rounded-full px-2 py-0.5">
                ✓ Verified
              </span>
            )}
            {player.membership_type && player.membership_type !== 'free' && (
              <span className="text-yellow-400 text-xs font-semibold bg-yellow-400/10 border border-yellow-400/30 rounded-full px-2 py-0.5 uppercase">
                {player.membership_type}
              </span>
            )}
            {hasActiveBan && (
              <span className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/30 rounded-full px-2 py-0.5">
                Banned
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-sm text-faceit-muted">
            {player.country && (
              <Image
                src={countryFlag(player.country)}
                alt={player.country}
                width={20}
                height={20}
                className='rounded-xs'
              />
            )}
            <span className="text-faceit-muted">·</span>
            <span className="text-faceit-muted">Member since {memberSince}</span>
          </div>

          <div className="flex items-center gap-6 mt-3 sm:hidden">
            <div>
              <div className="text-faceit-muted text-xs mb-0.5">ELO</div>
              <div className="text-2xl font-bold text-white">{elo.toLocaleString()}</div>
              {level < 10 && ELO_THRESHOLDS[level] !== undefined && (
                <div className="text-faceit-muted text-xs mt-0.5">
                  {(ELO_THRESHOLDS[level] - elo).toLocaleString()} to lv{level + 1}
                </div>
              )}
            </div>
            <FaceitLevel level={level} />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-8 shrink-0">
          <div className="text-center">
            <div className="text-faceit-muted text-xs mb-1">ELO</div>
            <div className="text-3xl font-bold text-white">{elo.toLocaleString()}</div>
            {level < 10 && ELO_THRESHOLDS[level] !== undefined && (
              <div className="text-faceit-muted text-xs mt-1">
                {(ELO_THRESHOLDS[level] - elo).toLocaleString()} until level {level + 1}
              </div>
            )}
          </div>
          <div className="text-center">
            <FaceitLevel level={level} />
          </div>
        </div>
      </div>

      {hasBans && (
        <div className="mt-5 pt-4 border-t border-faceit-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-faceit-muted uppercase tracking-wide">FACEIT Bans</span>
            {activeBans.length > 0 && (
              <span className="text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">
                {activeBans.length} active
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {[...activeBans, ...expiredBans].map((ban, i) => {
              const active = isBanActive(ban);
              return (
                <div
                  key={i}
                  className={clsx(
                    'flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-xs',
                    active ? 'bg-red-500/8 border border-red-500/20' : 'bg-faceit-card-dim border border-faceit-border'
                  )}
                >
                  <div className="flex flex-col items-center space-y-0.5 min-w-0">
                    <span className={clsx('font-semibold text-sm truncate', active ? 'text-red-400' : 'text-faceit-muted')}>
                      {banLabel(ban.reason)}
                    </span>
                    <span className="text-xs text-gray-400">{formatBanDate(ban.starts_at)}</span>
                  </div>
                  <div className="shrink-0 text-right text-gray-500 space-y-px">
                    <span className={clsx('font-semibold text-sm', active ? 'text-red-400' : '')}>
                      {!ban.ends_at
                        ? 'Permanent'
                        : active
                        ? `Until ${formatBanDate(ban.ends_at)}`
                        : `Expired ${formatBanDate(ban.ends_at)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function countryFlag(country: string): string {
  return `https://flagcdn.com/w40/${country.toLowerCase()}.png`;
}
