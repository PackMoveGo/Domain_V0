# SEO Hooks Documentation

This directory contains custom hooks for managing SEO metadata across the application.

## useSEO Hook

The `useSEO` hook provides a centralized way to manage SEO metadata with consistent defaults and automatic processing.

### Basic Usage

```tsx
import { useSEO } from '../hook/useSEO';

const MyComponent = () => {
  const seoData = useSEO({
    title: 'Custom Page Title',
    description: 'Custom page description',
    keywords: 'custom, keywords, here',
    image: '/images/custom-image.webp'
  });

  return <SEO {...seoData} />;
};
```

### Available Hooks

#### 1. `useSEO(config)`
Main hook that accepts a configuration object and returns processed SEO data.

**Parameters:**
- `config` (optional): SEO configuration object
  - `title`: Page title
  - `description`: Page description
  - `keywords`: Page keywords
  - `image`: Page image path
  - `url`: Page URL
  - `type`: Open Graph type (default: 'website')
  - `siteName`: Site name (default: 'Pack Move Go')
  - `twitterCard`: Twitter card type (default: 'summary_large_image')
  - `imageWidth`: Image width (default: '1920')
  - `imageHeight`: Image height (default: '1080')

**Returns:** SEO data object with processed values including `fullImageUrl` and `isWebP`.

#### 2. `usePageSEO(pageTitle, pageDescription, pageKeywords, pageImage, pageUrl)`
Simplified hook for page-specific SEO with common defaults.

```tsx
const seoData = usePageSEO(
  'About Us - Pack Move Go',
  'Learn more about our company',
  'about, company, moving',
  '/images/about.webp'
);
```

#### 3. `useServiceSEO(serviceName, serviceDescription, serviceImage)`
Hook for service-specific SEO with automatic title and keyword generation.

```tsx
const seoData = useServiceSEO(
  'Residential Moving',
  'Professional residential moving services',
  '/images/residential-moving.webp'
);
```

#### 4. `useLocationSEO(locationName, locationDescription, locationImage)`
Hook for location-specific SEO with automatic title and keyword generation.

```tsx
const seoData = useLocationSEO(
  'Irvine',
  'Professional moving services in Irvine',
  '/images/irvine-moving.webp'
);
```

### Features

- **Automatic URL Processing**: Ensures no trailing slashes
- **Image URL Processing**: Automatically converts relative paths to absolute URLs
- **WebP Detection**: Automatically detects WebP format for proper meta tags
- **Consistent Defaults**: Provides sensible defaults for all SEO properties
- **Memoization**: Uses `useMemo` for performance optimization
- **TypeScript Support**: Fully typed with comprehensive interfaces

### Default Configuration

The hook uses these defaults when no values are provided:

```tsx
const DEFAULT_SEO_CONFIG = {
  title: 'Pack Move Go - Professional Moving & Packing Services',
  description: 'Expert moving and packing services for residential and commercial moves...',
  keywords: 'moving services, packing services, residential moving...',
  image: '/moving-truck.webp',
  url: 'https://packmovego.com',
  type: 'website',
  siteName: 'Pack Move Go',
  twitterCard: 'summary_large_image',
  imageWidth: '1920',
  imageHeight: '1080'
};
```

### Integration with SEO Component

The hooks work seamlessly with the existing SEO component:

```tsx
import { usePageSEO } from '../hook/useSEO';
import SEO from '../component/SEO';

const MyPage = () => {
  const seoData = usePageSEO('My Page Title', 'My page description');
  
  return (
    <>
      <SEO {...seoData} />
      {/* Your page content */}
    </>
  );
};
```

### Benefits

1. **Consistency**: Ensures all pages use consistent SEO patterns
2. **Maintainability**: Centralized SEO logic makes updates easier
3. **Performance**: Memoized results prevent unnecessary re-renders
4. **Type Safety**: Full TypeScript support prevents errors
5. **Flexibility**: Multiple hooks for different use cases
6. **Automation**: Automatic processing of URLs and image formats 