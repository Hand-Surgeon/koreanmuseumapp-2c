// Hall name mapping for URLs
export const hallSlugMapping: Record<string, string> = {
  '고고관': 'archaeology',
  '미술관': 'art',
  '역사관': 'history',
  '아시아관': 'asia',
  '기증관': 'donation'
};

export const hallNameMapping: Record<string, string> = {
  'archaeology': '고고관',
  'art': '미술관',
  'history': '역사관',
  'asia': '아시아관',
  'donation': '기증관'
};

export function getHallSlug(hallName: string): string {
  return hallSlugMapping[hallName] || hallName;
}

export function getHallName(slug: string): string {
  return hallNameMapping[slug] || slug;
}