// Temporarily disabled for Next.js build
export const getAboutPageData = async () => {
  return {
    totalMoves: 0,
    happyCustomers: 0,
    yearsExperience: 0,
    citiesServed: 0
  };
};

export const getAboutPageStatusCode = async () => {
  return 200;
};

export const getAboutPageFailedEndpoints = async () => {
  return [];
};

export const getComprehensiveAboutPageData = async () => {
  return {
    companyInfo: {},
    teamMembers: [],
    statistics: {},
    nav: {},
    about: {},
    totalMovesCount: 0,
    health: {}
  };
};

export const loadCompanyInfoData = async () => {
  return {};
};

export const loadTeamMembersData = async () => {
  return [];
};

export const loadStatisticsData = async () => {
  return {};
};