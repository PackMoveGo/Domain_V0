export interface SearchResult {
  title: string;
  path: string;
  description: string;
}

interface SearchableContent {
  title: string;
  path: string;
  description: string;
  content?: string;
  tags?: string[];
}

// Dynamic search content - will be populated from API
let searchableContent: SearchableContent[] = [];

// Function to update searchable content from API data
export function updateSearchableContent(content: SearchableContent[]): void {
  searchableContent = content;
}

export function searchContent(query: string): SearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery || searchableContent.length === 0) return [];

  return searchableContent
    .filter(item => {
      const matchTitle = item.title.toLowerCase().includes(normalizedQuery);
      const matchDescription = item.description.toLowerCase().includes(normalizedQuery);
      const matchContent = item.content?.toLowerCase().includes(normalizedQuery) ?? false;
      const matchTags = item.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery)) ?? false;

      return matchTitle || matchDescription || matchContent || matchTags;
    })
    .map(({ title, path, description }) => ({
      title,
      path,
      description
    }));
} 