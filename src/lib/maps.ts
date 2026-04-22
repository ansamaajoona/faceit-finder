const MAP_DISPLAY: Record<string, string> = {
  de_mirage:      'Mirage',
  de_dust2:       'Dust 2',
  de_inferno:     'Inferno',
  de_nuke:        'Nuke',
  de_overpass:    'Overpass',
  de_ancient:     'Ancient',
  de_anubis:      'Anubis',
  de_vertigo:     'Vertigo',
  de_cache:       'Cache',
  de_train:       'Train',
  de_cobblestone: 'Cobblestone',
  de_tuscan:      'Tuscan',
};

export function mapDisplayName(raw: string): string {
  return MAP_DISPLAY[raw] ?? raw.replace(/^de_/, '').replace(/_/g, ' ');
}
