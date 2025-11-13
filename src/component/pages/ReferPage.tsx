import React, { useState } from 'react';
import { 
  ReferralProgram, 
  HowItWorksStep, 
  ReferralStats, 
  SocialPlatform, 
  ReferralForm, 
  SuccessStory,
  formatCurrency,
  generateReferralLink,
  copyToClipboard,
  shareOnSocialMedia,
  validateReferralForm
} from '../../util/referralParser';
import { getCurrentTimestamp } from '../../util/ssrUtils';
import { api } from '../../services/service.apiSW';

interface ReferProps {
  referralProgram?: ReferralProgram;
  howItWorks?: HowItWorksStep[];
  referralTerms?: string[];
  referralStats?: ReferralStats;
  socialSharing?: { title: string; description: string; platforms: SocialPlatform[] };
  referralForm?: ReferralForm;
  successStories?: SuccessStory[];
  isLoading: boolean;
  error: string | null;
}

const Refer: React.FC<ReferProps> = ({ 
  referralProgram, 
  howItWorks, 
  referralTerms, 
  referralStats, 
  socialSharing, 
  referralForm, 
  successStories,
  isLoading, 
  error 
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReferralLink, setShowReferralLink] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Debug logging
  console.log('🔧 ReferPage component received:', { 
    referralProgram: !!referralProgram,
    howItWorksCount: howItWorks?.length || 0,
    referralTermsCount: referralTerms?.length || 0,
    referralStats: !!referralStats,
    socialSharing: !!socialSharing,
    referralForm: !!referralForm,
    successStoriesCount: successStories?.length || 0,
    isLoading, 
    error 
  });

  // Safety checks for undefined objects
  const safeReferralProgram = referralProgram || {
    title: 'Referral Program',
    description: 'Join our referral program and earn rewards',
    mainReward: { amount: 0, currency: 'USD', type: 'cash', description: '' },
    bonusRewards: []
  };
  const safeHowItWorks = howItWorks && Array.isArray(howItWorks) ? howItWorks : [];
  const safeReferralTerms = referralTerms && Array.isArray(referralTerms) ? referralTerms : [];
  const safeReferralStats = referralStats || {
    totalReferrals: 0,
    totalRewardsPaid: 0,
    averageRewardPerReferral: 0,
    successfulReferrals: 0,
    pendingReferrals: 0
  };
  const safeSocialSharing = socialSharing || {
    title: 'Share Your Referral Link',
    description: 'Share with friends and start earning rewards',
    platforms: []
  };
  const safeReferralForm = referralForm || {
    title: 'Get Your Referral Link',
    description: 'Fill out the form below to get your unique referral link',
    fields: []
  };
  const safeSuccessStories = successStories && Array.isArray(successStories) ? successStories : [];

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral program...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Referral Program</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateReferralForm(formData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit to MongoDB-backed API
      const response = await api.submitReferralForm({
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone,
        refereeName: formData.friendName,
        refereeEmail: formData.friendEmail,
        refereePhone: formData.friendPhone
      });
      
      if (response.success && response.data) {
        // Use the referral link from the API response
        setReferralLink(response.data.referralLink);
      setShowReferralLink(true);
        console.log('✅ Referral submitted successfully:', response);
      } else {
        setFormErrors({ general: response.message || 'Failed to submit referral' });
      }
    } catch (error) {
      console.error('❌ Referral submission error:', error);
      setFormErrors({ 
        general: error instanceof Error ? error.message : 'Failed to submit referral. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform: string) => {
    const shareText = socialSharing.platforms.find(p => p.name.toLowerCase() === platform)?.shareText || '';
    shareOnSocialMedia(platform, shareText, referralLink);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {safeReferralProgram.title}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {safeReferralProgram.description}
        </p>
        {/* Debug info */}
        <div className="text-sm text-gray-500 mt-2">
          Found {safeHowItWorks.length} steps, {safeReferralTerms.length} terms, {safeSuccessStories.length} success stories
        </div>
      </div>

      {/* Main Reward Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 mb-12 text-white text-center">
        <div className="text-6xl mb-4">💰</div>
        <h2 className="text-3xl font-bold mb-2">
          Earn {formatCurrency(safeReferralProgram.mainReward.amount, safeReferralProgram.mainReward.currency)} Per Referral
        </h2>
        <p className="text-xl opacity-90">{safeReferralProgram.mainReward.description}</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{safeReferralStats.totalReferrals.toLocaleString()}</div>
          <div className="text-gray-600">Total Referrals</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(safeReferralStats.totalRewardsPaid, 'USD')}</div>
          <div className="text-gray-600">Total Rewards Paid</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{safeReferralStats.successfulReferrals.toLocaleString()}</div>
          <div className="text-gray-600">Successful Referrals</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{safeReferralStats.pendingReferrals}</div>
          <div className="text-gray-600">Pending Referrals</div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {safeHowItWorks.map((step) => (
            <div key={step.step} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                Step {step.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus Rewards */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Bonus Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safeReferralProgram.bonusRewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-4">🎁</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h3>
              <div className="text-2xl font-bold text-green-600 mb-3">
                {reward.currency === 'percent' ? `${reward.amount}%` : formatCurrency(reward.amount, reward.currency)}
              </div>
              <p className="text-gray-600 text-sm">{reward.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Form */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{safeReferralForm.title}</h2>
          <p className="text-gray-600">{safeReferralForm.description}</p>
        </div>

        {!showReferralLink ? (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            {formErrors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{formErrors.general}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safeReferralForm.fields.map((field) => (
                <div key={field.name} className={field.name === 'email' || field.name === 'phone' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Generating Link...' : 'Get My Referral Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Your Referral Link is Ready!</h3>
              <p className="text-green-700">Share this link with friends and start earning rewards.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-transparent border-none outline-none text-gray-700"
                />
                <button
                  onClick={handleCopyLink}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{safeSocialSharing.title}</h4>
              <div className="flex flex-wrap justify-center gap-4">
                {safeSocialSharing.platforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleShare(platform.name.toLowerCase())}
                    className={`${platform.color} text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2`}
                  >
                    <span>{platform.icon}</span>
                    <span>Share on {platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Stories */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safeSuccessStories.map((story) => (
            <div key={story.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-4">
                  {story.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{story.name}</h3>
                  <p className="text-sm text-gray-600">{story.location}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{story.story}</p>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 font-medium">{story.referrals} referrals</span>
                <span className="text-green-600 font-medium">Earned {formatCurrency(story.totalEarned, 'USD')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms & Conditions</h2>
        <ul className="space-y-3">
          {safeReferralTerms.map((term, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              <span className="text-gray-700">{term}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Start Earning?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of satisfied customers who are already earning rewards by referring friends to Pack Move Go.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started Now
          </button>
          <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
Refer.displayName = 'Refer';

export default Refer; 