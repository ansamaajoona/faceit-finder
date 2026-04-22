export interface FaceitGameInfo {
  game_player_id: string;
  game_player_name: string;
  skill_level: number;
  faceit_elo: number;
  region: string;
  skill_level_label: string;
  activated_at?: number;
}

export interface FaceitPlayer {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  cover_image: string;
  cover_featured_image?: string;
  platforms?: {
    steam?: string;
  };
  games: {
    cs2?: FaceitGameInfo;
    csgo?: FaceitGameInfo;
  };
  faceit_url: string;
  membership_type: string;
  verified?: boolean;
  steam_id_64?: string;
  activated_at?: string;
}

export interface FaceitLifetimeStats {
  player_id: string;
  game_id: string;
  lifetime: {
    'Average K/D Ratio'?: string;
    'Average Headshots %'?: string;
    Matches?: string;
    Wins?: string;
    'Win Rate %'?: string;
    'Longest Win Streak'?: string;
    'Current Win Streak'?: string;
    'Recent Results'?: string[];
    'K/D Ratio'?: string;
    'Headshots per Match'?: string;
    'Average Kills'?: string;
    'Total Headshots %'?: string;
  };
  segments: Array<{
    label: string;
    img_small: string;
    img_regular: string;
    stats: Record<string, string>;
    type: string;
    mode: string;
  }>;
}

export interface FaceitMatchPlayer {
  player_id: string;
  nickname: string;
  avatar: string;
  skill_level: number;
  game_player_id: string;
  game_player_name: string;
  faceit_url: string;
}

export interface FaceitTeam {
  team_id: string;
  nickname: string;
  avatar: string;
  type: string;
  players: FaceitMatchPlayer[];
}

export interface FaceitMatch {
  match_id: string;
  game_id: string;
  region: string;
  match_type: string;
  game_mode: string;
  max_players: number;
  teams_size: number;
  teams: {
    faction1: FaceitTeam;
    faction2: FaceitTeam;
  };
  playing_players: string[];
  competition_id: string;
  competition_name: string;
  competition_type: string;
  organizer_id: string;
  status: string;
  started_at: number;
  finished_at: number;
  results: {
    winner: string;
    score: {
      faction1: number;
      faction2: number;
    };
  };
  faceit_url: string;
}

export interface FaceitMatchHistory {
  items: FaceitMatch[];
  start: number;
  end: number;
}

export interface FaceitBan {
  ends_at?: string;
  starts_at: string;
  game: string;
  nickname: string;
  reason: string;
  type: string;
  user_id: string;
}

import type { SteamAccountStats } from '@/lib/steam';

export interface PlayerSearchResult {
  player: FaceitPlayer;
  game: string;
  foundBy: 'steam' | 'nickname';
  steam?: SteamAccountStats | null;
  bans?: FaceitBan[] | null;
}
