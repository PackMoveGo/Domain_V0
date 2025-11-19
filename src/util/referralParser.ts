import { api } from '../services/service.apiSW';

export interface MainReward {
  amount: number;
  currency: string;
  type: string;
  description: string;
}

export interface BonusReward {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  type: string;
}

export interface ReferralProgram {
  title: string;
  description: string;
  mainReward: MainReward;
  bonusRewards: BonusReward[];
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface ReferralStats {
  totalReferrals: number;
  totalRewardsPaid: number;
  averageRewardPerReferral: number;
  successfulReferrals: number;
  pendingReferrals: number;
}

export interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  shareText: string;
}

export interface SocialSharing {
  title: string;
  description: string;
  platforms: SocialPlatform[];
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
}

export interface ReferralForm {
  title: string;
  description: string;
  fields: FormField[];
}

export interface SuccessStory {
  id: number;
  name: string;
  location: string;
  referrals: number;
  totalEarned: number;
  story: string;
  avatar: string;
}

export interface ReferralData {
  referralProgram: ReferralProgram;
  howItWorks: HowItWorksStep[];
  referralTerms: string[];
  referralStats: ReferralStats;
  socialSharing: SocialSharing;
  referralForm: ReferralForm;
  successStories: SuccessStory[];
}

export async function fetchReferralData(): Promise<ReferralData> {
  try {
    console.log('🚀 Fetching referral data from API...');
    
    // Use the API method
    const response = await api.getReferral();
    console.log('📡 Referral API response:', response);
    console.log('📡 Response type:', typeof response);
    console.log('📡 Response keys:', response ? Object.keys(response) : 'null/undefined');
    
    // CRITICAL: Check if response is an error object (503 or other errors) - MUST CHECK FIRST
    if (response && typeof response === 'object' && 
        ((response as any).error || (response as any).is503Error || (response as any).statusCode === 503 || (response as any).isConnectionError)) {
      console.warn('⚠️ Referral API returned error response:', response);
      const error = new Error((response as any).message || '503 Service Unavailable');
      (error as any).is503Error = true;
      (error as any).statusCode = (response as any).statusCode || 503;
      (error as any).isConnectionError = (response as any).isConnectionError || false;
      throw error;
    }
    
    // Handle different response formats
    if (response && response.referralProgram && response.howItWorks && response.referralStats) {
      console.log('✅ Referral data loaded successfully');
      console.log('📊 Referral program:', !!response.referralProgram);
      console.log('📊 How it works steps:', response.howItWorks?.length || 0);
      console.log('📊 Stats:', !!response.referralStats);
      return response as ReferralData;
    } else if (response && response.success && response.data && response.data.referralProgram) {
      console.log('✅ Referral data loaded from wrapped response');
      return response.data as ReferralData;
    } else {
      console.warn('⚠️ Unexpected referral data format:', response);
      console.warn('⚠️ Expected structure: { referralProgram: {...}, howItWorks: [...], referralStats: {...}, ... }');
      throw new Error('Invalid referral data format');
    }
  } catch (error) {
    console.error('❌ Error loading referral data:', error);
    // Check if this is a 503 error
    if (error instanceof Error && (error as any).is503Error) {
      throw new Error('503 Service Unavailable');
    }
    throw new Error('Failed to load referral data');
  }
}

export function formatCurrency(amount: number, currency: string): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  if (currency === 'percent') {
    return `${amount}%`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function generateReferralLink(userId: string): string {
  if (!userId || typeof userId !== 'string') {
    return 'https://packmovego.com/ref/unknown';
  }
  return `https://packmovego.com/ref/${userId}`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (!text || typeof text !== 'string') {
    return Promise.reject(new Error('Invalid text to copy'));
  }
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return Promise.reject(new Error('Clipboard API not available'));
  }
  return navigator.clipboard.writeText(text);
}

export function shareOnSocialMedia(platform: string, text: string, url: string): void {
  if (!platform || !text || !url) {
    console.warn('Invalid parameters for social media sharing');
    return;
  }
  
  if (typeof window === 'undefined') {
    console.warn('Window object not available for social media sharing');
    return;
  }
  
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
  };
  
  const shareUrl = shareUrls[platform as keyof typeof shareUrls];
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  } else {
    console.warn(`Unsupported social media platform: ${platform}`);
  }
}

export function validateReferralForm(formData: Record<string, string>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  if (!formData || typeof formData !== 'object') {
    return {
      isValid: false,
      errors: { general: 'Invalid form data' }
    };
  }
  
  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }
  
  if (!formData.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (formData.phone && !/^[+]?[1-9]\d{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 