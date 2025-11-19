
import React, { useEffect, useCallback } from 'react';
import { logger } from '../util/debug';
import SectionWarning from '../component/ui/SectionWarning';
import { useSectionVerification } from '../context/SectionVerificationContext';

interface SectionConfig {
  id: string;
  title: string;
}

// Default sections for home page
const defaultHomeSections: SectionConfig[] = [
  { id: 'hero', title: 'Hero Section' },
  { id: 'statistics', title: 'Statistics Section' },
  { id: 'services', title: 'Services Section' },
  { id: 'process-steps', title: 'Process Steps Section' },
  { id: 'testimonials', title: 'Testimonials Section' },
  { id: 'recent-moves', title: 'Recent Moves Section' },
  { id: 'why-choose-us', title: 'Why Choose Us Section' },
  { id: 'service-areas', title: 'Service Areas Section' },
  { id: 'faq', title: 'FAQ Section' },
  { id: 'emergency-contact', title: 'Emergency Contact Section' },
  { id: 'download-apps', title: 'Download Apps Section' },
  { id: 'final-cta', title: 'Final CTA Section' },
  { id: 'quote-form', title: 'Quote Form Section' }
];

// Default sections for about page
const defaultAboutSections: SectionConfig[] = [
  { id: 'hero', title: 'About Hero Section' },
  { id: 'our-story', title: 'Our Story Section' },
  { id: 'mission-values', title: 'Mission & Values Section' },
  { id: 'team', title: 'Our Team Section' },
  { id: 'services', title: 'Our Services Section' },
  { id: 'why-choose-us', title: 'Why Choose Us Section' },
  { id: 'search-results', title: 'Search Results Section' },
  { id: 'quote-form', title: 'Quote Form Section' }
];

// Default sections for contact page
const defaultContactSections: SectionConfig[] = [
  { id: 'contact-header', title: 'Contact Header Section' },
  { id: 'contact-methods', title: 'Contact Methods Section' },
  { id: 'office-locations', title: 'Office Locations Section' },
  { id: 'contact-form', title: 'Contact Form Section' },
  { id: 'faq', title: 'FAQ Section' },
  { id: 'business-hours', title: 'Business Hours Section' },
  { id: 'contact-cta', title: 'Contact CTA Section' },
  { id: 'quote-form', title: 'Quote Form Section' }
];

// Default sections (home page for backward compatibility)
const defaultSections = defaultHomeSections;

export const useGiveSectionId = (sections: SectionConfig[] = defaultSections) => {
  const {
    isTampered,
    showWarning,
    verificationDetails,
    verifySections,
    dismissWarning
  } = useSectionVerification();

  const verifyCurrentSections = useCallback(async () => {
    await verifySections(
      sections.map(s => s.id),
      window.location.pathname
    );
  }, [sections, verifySections]);

  useEffect(() => {
    // Log sections for debugging (development only) - only once per session
    if (process.env.NODE_ENV === 'development' && !sessionStorage.getItem('sections-logged')) {
      logger.debug('Active sections:', sections.map(s => s.id).join(', '));
      sessionStorage.setItem('sections-logged', 'true');
    }

    // Initial verification
    verifyCurrentSections();

    // Set up periodic verification - reduced frequency
    const verificationInterval = setInterval(verifyCurrentSections, 60000); // Check every 60 seconds instead of 30

    return () => clearInterval(verificationInterval);
  }, [sections, verifyCurrentSections]);

  const getSection = useCallback((id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) {
      logger.warn(`Section with id "${id}" not found`);
      return { id, title: id };
    }
    return section;
  }, [sections]);

  const getSectionProps = (id: string) => {
    const section = getSection(id);
    return {
      id: section.id,
      'aria-label': section.title,
      'data-section': section.id,
      'data-verified': !isTampered,
      'data-verification-details': verificationDetails ? JSON.stringify(verificationDetails) : ''
    };
  };

  return { 
    getSectionProps, 
    isTampered,
    SectionWarning: () => (
      <SectionWarning 
        isVisible={showWarning} 
        onDismiss={dismissWarning}
      />
    )
  };
};

// Export specific section configurations for different pages
export { defaultHomeSections, defaultAboutSections, defaultContactSections }; 