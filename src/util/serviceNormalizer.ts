export interface NormalizedService {
  id: string;
  title: string;
  description: string;
  price: string | null;
  duration?: string;
  icon?: string;
  link?: string;
}

function toDisplayString(value: any): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    if ('display' in value && typeof value.display === 'string') return value.display as string;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function normalizeService(raw: any): NormalizedService {
  const priceStr = toDisplayString(raw?.price);
  const durationStr = toDisplayString(raw?.duration) || undefined;

  const normalized: NormalizedService = {
    id: String(raw?.id ?? ''),
    title: typeof raw?.title === 'string' ? raw.title : toDisplayString(raw?.title) || 'Untitled Service',
    description: typeof raw?.description === 'string' ? raw.description : toDisplayString(raw?.description) || '',
    price: priceStr,
    duration: durationStr,
    icon: typeof raw?.icon === 'string' ? raw.icon : '🛠️',
    link: typeof raw?.link === 'string' ? raw.link : undefined,
  };

  return normalized;
}

export function normalizeServices(list: any[]): NormalizedService[] {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeService);
}


