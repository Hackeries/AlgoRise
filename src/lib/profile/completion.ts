/**
 * Profile completion percentage calculator
 * Calculates how complete a user's profile is based on filled fields
 */

export interface ProfileData {
  // CF Handle
  cf_verified?: boolean;
  cf_handle?: string;
  
  // Basic profile info
  status?: 'student' | 'working' | null;
  
  // Student fields
  degree_type?: string | null;
  college_id?: string | null;
  year?: string | null;
  
  // Working professional fields
  company_id?: string | null;
  custom_company?: string | null;
  
  // Optional competitive programming handles
  leetcode_handle?: string | null;
  codechef_handle?: string | null;
  atcoder_handle?: string | null;
  gfg_handle?: string | null;
}

export interface ProfileCompletionDetails {
  percentage: number;
  completed: string[];
  missing: string[];
  isComplete: boolean;
}

/**
 * Field weights for profile completion calculation
 * Required fields have higher weight
 */
const FIELD_WEIGHTS = {
  // Required fields (70% total)
  cf_verified: 30,          // CF verification is crucial
  status: 10,               // Student or working status
  degree_or_company: 20,    // Degree+College+Year OR Company
  basic_education: 10,      // College and year for students
  
  // Optional fields (30% total)
  leetcode_handle: 7.5,
  codechef_handle: 7.5,
  atcoder_handle: 7.5,
  gfg_handle: 7.5,
};

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(profile: ProfileData): ProfileCompletionDetails {
  let totalScore = 0;
  const completed: string[] = [];
  const missing: string[] = [];
  
  // CF Verification (30 points)
  if (profile.cf_verified && profile.cf_handle) {
    totalScore += FIELD_WEIGHTS.cf_verified;
    completed.push('Codeforces verification');
  } else {
    missing.push('Codeforces verification');
  }
  
  // Status (10 points)
  if (profile.status) {
    totalScore += FIELD_WEIGHTS.status;
    completed.push('Status (Student/Working)');
    
    // Education/Company details (30 points total)
    if (profile.status === 'student') {
      if (profile.degree_type && profile.college_id && profile.year) {
        totalScore += FIELD_WEIGHTS.degree_or_company;
        totalScore += FIELD_WEIGHTS.basic_education;
        completed.push('Education details (Degree, College, Year)');
      } else {
        missing.push('Education details');
        if (!profile.degree_type) missing.push('Degree type');
        if (!profile.college_id) missing.push('College');
        if (!profile.year) missing.push('Year of study');
      }
    } else if (profile.status === 'working') {
      if (profile.company_id || profile.custom_company) {
        totalScore += FIELD_WEIGHTS.degree_or_company;
        totalScore += FIELD_WEIGHTS.basic_education; // Give same weight as education
        completed.push('Company details');
      } else {
        missing.push('Company details');
      }
    }
  } else {
    missing.push('Status (Student/Working)');
    missing.push('Education/Company details');
  }
  
  // Optional CP platform handles (30 points total, 7.5 each)
  if (profile.leetcode_handle) {
    totalScore += FIELD_WEIGHTS.leetcode_handle;
    completed.push('LeetCode handle');
  } else {
    missing.push('LeetCode handle');
  }
  
  if (profile.codechef_handle) {
    totalScore += FIELD_WEIGHTS.codechef_handle;
    completed.push('CodeChef handle');
  } else {
    missing.push('CodeChef handle');
  }
  
  if (profile.atcoder_handle) {
    totalScore += FIELD_WEIGHTS.atcoder_handle;
    completed.push('AtCoder handle');
  } else {
    missing.push('AtCoder handle');
  }
  
  if (profile.gfg_handle) {
    totalScore += FIELD_WEIGHTS.gfg_handle;
    completed.push('GeeksforGeeks handle');
  } else {
    missing.push('GeeksforGeeks handle');
  }
  
  const percentage = Math.min(100, Math.round(totalScore));
  const isComplete = percentage === 100;
  
  return {
    percentage,
    completed,
    missing,
    isComplete,
  };
}

/**
 * Get a user-friendly message about profile completion
 */
export function getProfileCompletionMessage(completion: ProfileCompletionDetails): string {
  if (completion.isComplete) {
    return 'Your profile is 100% complete! 🎉';
  }
  
  if (completion.percentage >= 70) {
    return `Your profile is ${completion.percentage}% complete. You're almost there!`;
  }
  
  if (completion.percentage >= 40) {
    return `Your profile is ${completion.percentage}% complete. Add more details to unlock all features.`;
  }
  
  return `Your profile is ${completion.percentage}% complete. Complete your profile to get the best experience.`;
}

/**
 * Get the next suggested field to complete
 */
export function getNextSuggestion(completion: ProfileCompletionDetails): string | null {
  // Prioritize required fields
  const requiredMissing = [
    'Codeforces verification',
    'Status (Student/Working)',
    'Education details',
    'Company details',
    'Degree type',
    'College',
    'Year of study',
  ];
  
  for (const required of requiredMissing) {
    if (completion.missing.includes(required)) {
      return required;
    }
  }
  
  // Then optional fields
  if (completion.missing.length > 0) {
    return completion.missing[0];
  }
  
  return null;
}

/**
 * Check if user has completed minimum required profile fields
 * (CF verification + Status + Education/Company)
 */
export function hasMinimumProfile(profile: ProfileData): boolean {
  if (!profile.cf_verified || !profile.status) {
    return false;
  }
  
  if (profile.status === 'student') {
    return !!(profile.degree_type && profile.college_id && profile.year);
  }
  
  if (profile.status === 'working') {
    return !!(profile.company_id || profile.custom_company);
  }
  
  return false;
}

/**
 * Get profile tier based on completion percentage
 */
export function getProfileTier(percentage: number): {
  tier: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  label: string;
  color: string;
} {
  if (percentage === 100) {
    return {
      tier: 'expert',
      label: 'Complete Profile',
      color: 'text-green-600',
    };
  }
  
  if (percentage >= 70) {
    return {
      tier: 'advanced',
      label: 'Advanced Profile',
      color: 'text-blue-600',
    };
  }
  
  if (percentage >= 40) {
    return {
      tier: 'intermediate',
      label: 'Intermediate Profile',
      color: 'text-yellow-600',
    };
  }
  
  return {
    tier: 'beginner',
    label: 'Beginner Profile',
    color: 'text-gray-600',
  };
}
