// /lib/translations/index.ts
import { startTranslations } from './pages/start';
import { loginTranslations } from './pages/login';
import { homeTranslations } from './pages/home';
import { applicationsTranslations } from './pages/applications';
import { settingsTranslations } from './pages/settings';
import { postingDetailTranslations } from './pages/posting-detail';
import { applyTranslations } from './pages/apply';
import { resumeTranslations } from './pages/resume';
import { infoTranslations } from './pages/info';
import { calendarTranslations } from './pages/calendar';
import { interviewTranslations } from './pages/interview';
import { suitabilityTranslations } from './pages/suitability';
import { shopTranslations } from './pages/shop';
import { usageHistoryTranslations } from './pages/usage-history';
import { applicationMethodTranslations } from './pages/application-method';
import { commonTranslations } from './common';
import { tabTranslations } from './components/tabs';
import { jobDetailModalTranslations } from './components/jobDetailModal';
import { TranslationData } from './types';
// 모든 번역 데이터 합치기
export const translations: TranslationData = {
    ...commonTranslations,
    ...tabTranslations,
    ...startTranslations,
    ...loginTranslations,
    ...homeTranslations,
    ...applicationsTranslations,
    ...settingsTranslations,
    ...postingDetailTranslations,
    ...applyTranslations,
    ...resumeTranslations,
    ...infoTranslations,
    ...calendarTranslations,
    ...interviewTranslations,
    ...suitabilityTranslations,
    ...shopTranslations,
    ...usageHistoryTranslations,
    ...applicationMethodTranslations,
    ...jobDetailModalTranslations,
};