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
  const serviceId = String(raw?.id ?? raw?.slug ?? '');
  
  // Generate link if not provided - use id, slug, or create from title
  let serviceLink: string | undefined;
  if (typeof raw?.link === 'string' && raw.link) {
    serviceLink = raw.link;
  } else if (serviceId) {
    // Use id or slug to create link
    serviceLink = `/services/${serviceId}`;
  } else if (raw?.title) {
    // Create slug from title as fallback
    const slug = typeof raw.title === 'string' 
      ? raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : '';
    if (slug) {
      serviceLink = `/services/${slug}`;
    }
  }

  const normalized: NormalizedService = {
    id: serviceId,
    title: typeof raw?.title === 'string' ? raw.title : toDisplayString(raw?.title) || 'Untitled Service',
    description: typeof raw?.description === 'string' ? raw.description : toDisplayString(raw?.description) || '',
    price: priceStr,
    duration: durationStr,
    icon: typeof raw?.icon === 'string' ? raw.icon : '🛠️',
    link: serviceLink,
  };

  return normalized;
}

export function normalizeServices(list: any[]): NormalizedService[] {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeService);
}


