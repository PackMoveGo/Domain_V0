# Component Organization

This directory contains all React components organized by their purpose and usage patterns.

## Directory Structure

### `/ui/` - Shared UI Components
Reusable UI components used across multiple pages.

#### `/ui/feedback/`
- `ErrorBoundary.tsx` - Error handling wrapper component

#### `/ui/navigation/`
- `ScrollToTopButton.tsx` - Scroll to top functionality
- `NavigationAwareWrapper.tsx` - Navigation state management

#### `/ui/overlay/`
- `OptOutButton.tsx` - User opt-out functionality
- `OptOutOverlay.tsx` - Overlay for opt-out actions

#### Root UI Components
- `LoadingSpinner.tsx` - Loading spinner component
- `SkeletonLoader.tsx` - Skeleton loading states
- `SmoothContentLoader.tsx` - Smooth content loading
- `SectionWarning.tsx` - Warning/error section display
- `NoDataSection.tsx` - Empty state display
- `AppContent.tsx` - Main app content wrapper
- `DownloadApps.tsx` - App download section
- `Footer.tsx` - Site footer component

### `/forms/` - Form Components
Reusable form components and form-related functionality.

- `QuoteForm.tsx` - Quote request form
- `QuoteFormSection.tsx` - Quote form section wrapper
- `SignupForm.tsx` - User signup form

### `/pages/` - Page-Specific Components
Components that are specific to individual pages.

- `ContactPage.tsx` - Contact page component
- `Hero.tsx` - Homepage hero section
- `Reviews.tsx` - Reviews page component
- `Locations.tsx` - Service locations component
- `Supplies.tsx` - Moving supplies component
- `FAQ.tsx` - FAQ page component
- `Blog.tsx` - Blog listing component
- `BlogWithApi.tsx` - Blog with API integration
- `AboutPageExample.tsx` - About page example
- `ReferPage.tsx` - Referral page component

### `/loading/` - Loading and Performance Components
Components related to loading states and performance optimization.

- `LoadingSection.tsx` - Loading section wrapper
- `ProgressiveLoader.tsx` - Progressive loading component
- `RouteLoader.tsx` - Route loading component
- `LazySection.tsx` - Lazy loading section
- `LazyLoadingExample.tsx` - Lazy loading example

### `/business/` - Business Logic Components
Components that implement specific business functionality.

#### `/business/services/`
- `OurServices.tsx` - Services overview component
- `OurServicesLazy.tsx` - Lazy-loaded services component
- `ServicesList.tsx` - Services list component
- `ServicesSlideshow.tsx` - Services slideshow
- `ServicesUnavailable.tsx` - Services unavailable state
- `EnhancedServicesComponent.tsx` - Enhanced services display

#### `/business/marketing/`
- `RecentMoves.tsx` - Recent moves showcase
- `ProcessSteps.tsx` - Process steps display
- `Statistics.tsx` - Statistics display
- `FinalCTA.tsx` - Final call-to-action

#### `/business/contact/`
- `EmergencyContact.tsx` - Emergency contact information

#### Root Business Components
- `Analytics.tsx` - Analytics tracking component
- `SEO.tsx` - SEO optimization component
- `UserTrackingProvider.tsx` - User tracking context provider
- `UserDisplay.tsx` - User information display
- `ContextLoader.tsx` - Context loading component

### `/navigation/` - Navigation Components
Navigation-related components (existing folder).

- `Navbar.tsx` - Main navigation bar
- `MobileNavbar.tsx` - Mobile navigation
- `DesktopNavbar.tsx` - Desktop navigation
- `SearchBar.tsx` - Search functionality
- `search.ts` - Search utilities
- `Controller.tsx` - Navigation controller

### `/layout/` - Layout Components
Layout and structure components (existing folder).

- `Layout.tsx` - Main layout wrapper

### `/features/` - Feature Components
Feature-specific components (existing folder).

- `Feature.tsx` - Feature display component
- `WhyChooseUs.tsx` - Why choose us section

### `/testimonials/` - Testimonial Components
Testimonial-related components (existing folder).

### `/service-areas/` - Service Area Components
Service area components (existing folder).

### `/cookieconsent/` - Cookie Consent Components
Cookie consent functionality (existing folder).

### `/cors/` - CORS Components
CORS-related components (existing folder).

### `/jwt/` - JWT Components
JWT authentication components (existing folder).

### `/error/` - Error Components
Error handling components (existing folder).

### `/devtools/` - Development Tools
Development and debugging tools (existing folder).

### `/__tests__/` - Test Files
Component test files (existing folder).

## Component Guidelines

### Naming Conventions
- Use PascalCase for component names
- Use descriptive names that indicate the component's purpose
- Include the component type in the name (e.g., `Button`, `Form`, `Page`)

### File Organization
- Each component should be in its own file
- Related components can be grouped in subdirectories
- Use index files for clean imports when appropriate

### Import/Export Patterns
- Use named exports for utility components
- Use default exports for main components
- Group related imports together

### Component Structure
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props
- Include proper error boundaries and loading states

## Usage Examples

### Importing UI Components
```tsx
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../ui/feedback/ErrorBoundary';
```

### Importing Form Components
```tsx
import QuoteForm from '../forms/QuoteForm';
import SignupForm from '../forms/SignupForm';
```

### Importing Page Components
```tsx
import ContactPage from '../pages/ContactPage';
import Hero from '../pages/hero.home';
```

### Importing Business Components
```tsx
import OurServices from '../business/services/OurServices';
import Statistics from '../business/marketing/Statistics';
```

## Migration Notes

This organization was implemented to improve:
- **Maintainability**: Related components are grouped together
- **Discoverability**: Clear folder structure makes it easy to find components
- **Scalability**: New components can be easily categorized
- **Reusability**: Shared components are clearly separated from page-specific ones

When adding new components, please follow the established patterns and place them in the appropriate directory based on their purpose and usage patterns.
