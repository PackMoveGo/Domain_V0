import { api } from '../services/service.apiSW';

export interface SupplyItem {
  id: string;
  name: string;
  description: string;
  dimensions?: string;
  size?: string;
  contents?: string;
  price: number;
  inStock?: boolean;
  popular?: boolean;
  category?: string;
  image?: string;
}

export interface SupplyCategory {
  id: string;
  category: string;
  icon: string;
  items: SupplyItem[];
}

export interface SuppliesData {
  supplies: SupplyCategory[];
}

export async function fetchSuppliesData(): Promise<SuppliesData> {
  try {
    console.log('🚀 Fetching supplies data from API...');
    
    // Use the API method
    const response = await api.getSupplies();
    console.log('📡 Supplies API response:', response);
    console.log('📡 Response type:', typeof response);
    console.log('📡 Response keys:', response ? Object.keys(response) : 'null/undefined');
    
    // CRITICAL: Check if response is an error object (503 or other errors) - MUST CHECK FIRST
    if (response && typeof response === 'object' && 
        ((response as any).error || (response as any).is503Error || (response as any).statusCode === 503 || (response as any).isConnectionError)) {
      console.warn('⚠️ Supplies API returned error response:', response);
      const error = new Error((response as any).message || '503 Service Unavailable');
      (error as any).is503Error = true;
      (error as any).statusCode = (response as any).statusCode || 503;
      (error as any).isConnectionError = (response as any).isConnectionError || false;
      throw error;
    }
    
    // Handle different response formats
    let suppliesData: SupplyCategory[] = [];
    
    if (response && response.supplies && Array.isArray(response.supplies)) {
      console.log('✅ Supplies data loaded successfully');
      console.log('📊 Raw supplies data:', response.supplies);
      console.log('📊 First item structure:', response.supplies[0]);
      
      // Check if the data is already in category format
      if (response.supplies.length > 0) {
        const firstItem = response.supplies[0];
        if (firstItem && firstItem.category && firstItem.items && Array.isArray(firstItem.items)) {
          // Data is already in category format
          console.log('✅ Data is already in category format');
          suppliesData = response.supplies;
        } else {
          // Data is in flat format, needs transformation
          console.log('✅ Data is in flat format, transforming to categories');
          suppliesData = transformSuppliesToCategories(response.supplies);
        }
      }
    } else if (response && response.success && response.data && response.data.supplies) {
      console.log('✅ Supplies data loaded from wrapped response');
      suppliesData = Array.isArray(response.data.supplies) ? response.data.supplies : [];
    } else if (response && Array.isArray(response)) {
      // Handle case where response is directly an array
      console.log('✅ Supplies data is direct array format');
      const firstItem = response[0];
      if (firstItem && firstItem.category && firstItem.items) {
        suppliesData = response;
      } else {
        suppliesData = transformSuppliesToCategories(response);
      }
    } else {
      console.warn('⚠️ Unexpected supplies data format:', response);
      console.warn('⚠️ Expected structure: { supplies: [...] } or array of categories');
      throw new Error('Invalid supplies data format');
    }
    
    // Validate and clean the data
    suppliesData = suppliesData.filter(category => 
      category && 
      category.category && 
      category.items && 
      Array.isArray(category.items) && 
      category.items.length > 0
    );
    
    console.log('✅ Final supplies data:', suppliesData);
    console.log('📊 Categories count:', suppliesData.length);
    console.log('📊 Total items across all categories:', suppliesData.reduce((total, cat) => total + (cat.items?.length || 0), 0));
    
    if (suppliesData.length === 0) {
      console.warn('⚠️ No supplies data found after processing');
      throw new Error('No supplies data available');
    }
    
    return { supplies: suppliesData };
  } catch (error) {
    console.error('❌ Error loading supplies data:', error);
    // Check if this is a 503 error
    if (error instanceof Error && (error as any).is503Error) {
      throw new Error('503 Service Unavailable');
    }
    throw new Error('Failed to load supplies data');
  }
}

function transformSuppliesToCategories(supplies: SupplyItem[]): SupplyCategory[] {
  const categoryMap = new Map<string, SupplyItem[]>();
  
  // Group supplies by category
  supplies.forEach(supply => {
    const category = supply.category || 'other';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    
    // Add default values for missing properties
    const enhancedSupply: SupplyItem = {
      ...supply,
      inStock: supply.inStock ?? true,
      popular: supply.popular ?? false
    };
    
    categoryMap.get(category)!.push(enhancedSupply);
  });
  
  // Convert map to array of categories
  const categories: SupplyCategory[] = [];
  categoryMap.forEach((items, categoryName) => {
    categories.push({
      id: categoryName,
      category: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
      icon: getCategoryIcon(categoryName),
      items: items
    });
  });
  
  return categories;
}

function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'boxes': '📦',
    'tape': '🎀',
    'bubble-wrap': '🫧',
    'furniture-pads': '🛡️',
    'labels': '🏷️',
    'other': '📋'
  };
  
  return iconMap[category] || '📋';
}

export function getPopularSupplies(supplies: SupplyCategory[]): SupplyItem[] {
  const popularItems: SupplyItem[] = [];
  
  if (!supplies || !Array.isArray(supplies)) {
    return popularItems;
  }
  
  supplies.forEach(category => {
    if (category.items && Array.isArray(category.items)) {
      category.items.forEach(item => {
        if (item.popular) {
          popularItems.push(item);
        }
      });
    }
  });
  
  return popularItems;
}

export function getSuppliesByCategory(supplies: SupplyCategory[], categoryId: string): SupplyCategory | undefined {
  if (!supplies || !Array.isArray(supplies)) {
    return undefined;
  }
  return supplies.find(category => category.id === categoryId);
}

export function searchSupplies(supplies: SupplyCategory[], searchTerm: string): SupplyItem[] {
  const searchResults: SupplyItem[] = [];
  const term = searchTerm.toLowerCase();
  
  if (!supplies || !Array.isArray(supplies)) {
    return searchResults;
  }
  
  supplies.forEach(category => {
    if (category.items && Array.isArray(category.items)) {
      category.items.forEach(item => {
        if (
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          category.category.toLowerCase().includes(term)
        ) {
          searchResults.push(item);
        }
      });
    }
  });
  
  return searchResults;
} 