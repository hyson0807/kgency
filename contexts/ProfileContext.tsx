import React, { createContext, useContext, useState, ReactNode } from 'react';

// 타입 정의 (useProfile.ts에서 가져온 타입들)
interface Profile {
  id: string;
  user_type: 'user' | 'company';
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  description?: string;
  onboarding_completed: boolean;
  job_seeking_active?: boolean;
  profile_image_url?: string | null;
  created_at?: string;
}

interface UserInfo {
  id: string;
  user_id: string;
  name?: string;
  age?: number;
  gender?: string;
  visa?: string;
  korean_level?: string;
  how_long?: string | null;
  experience?: string | null;
  topic?: string;
  experience_content?: string | null;
  preferred_days?: string[];
  preferred_times?: string[];
}

type FullProfile = Profile & {
  user_info?: UserInfo;
};

interface ProfileContextType {
  preloadedProfile: FullProfile | null;
  setPreloadedProfile: (profile: FullProfile | null) => void;
  isProfilePreloaded: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [preloadedProfile, setPreloadedProfile] = useState<FullProfile | null>(null);

  const value = {
    preloadedProfile,
    setPreloadedProfile,
    isProfilePreloaded: !!preloadedProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};