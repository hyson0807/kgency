// contexts/TranslationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

interface TranslationCache {
    [key: string]: string;
}

interface TranslationContextType {
    language: string;
    changeLanguage: (lang: string) => Promise<void>;
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
    translateDB: (tableName: string, columnName: string, rowId: string, defaultText: string) => string;
    loading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = (): TranslationContextType => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within TranslationProvider');
    }
    return context;
};

interface TranslationProviderProps {
    children: ReactNode;
}

// 정적 번역 데이터
const translations: { [key: string]: { [lang: string]: string } } = {
    // Start 페이지
    'start.title': {
        en: 'Looking for a job?',
        ja: '仕事をお探しですか？',
        zh: '找工作吗？',
        vi: 'Bạn đang tìm việc?'
    },
    'start.subtitle': {
        en: 'We\'ll find the perfect job\nfor you in just 30 seconds',
        ja: '30秒であなたにぴったりの\n仕事を見つけます',
        zh: '30秒内为您找到\n最适合的工作',
        vi: 'Chúng tôi sẽ tìm công việc\nphù hợp cho bạn trong 30 giây'
    },
    'start.button': {
        en: 'Get Started',
        ja: '始める',
        zh: '开始',
        vi: 'Bắt đầu'
    },
    'start.employer_login': {
        en: 'Employer Login',
        ja: '求人者ログイン',
        zh: '雇主登录',
        vi: 'Đăng nhập nhà tuyển dụng'
    },

    // 로그인 페이지
    'login.phone_auth': {
        en: 'Phone Verification',
        ja: '電話番号認証',
        zh: '电话验证',
        vi: 'Xác thực số điện thoại'
    },
    'login.subtitle': {
        en: 'Please verify your identity for smooth service',
        ja: 'スムーズなサービス利用のため本人確認をお願いします',
        zh: '为了顺利使用服务，请进行身份验证',
        vi: 'Vui lòng xác thực để sử dụng dịch vụ thuận tiện'
    },
    'login.phone_number': {
        en: 'Phone Number',
        ja: '携帯電話番号',
        zh: '手机号码',
        vi: 'Số điện thoại'
    },
    'login.get_code': {
        en: 'Get Code',
        ja: '認証番号を受け取る',
        zh: '获取验证码',
        vi: 'Nhận mã'
    },
    'login.verification_code': {
        en: 'Verification Code',
        ja: '認証番号',
        zh: '验证码',
        vi: 'Mã xác thực'
    },
    'login.verify': {
        en: 'Verify',
        ja: '認証する',
        zh: '验证',
        vi: 'Xác thực'
    },
    'login.resend': {
        en: 'Resend Code',
        ja: '認証番号を再送信',
        zh: '重新发送验证码',
        vi: 'Gửi lại mã'
    },
    'login.auto_verify_info': {
        en: 'Verification will be done automatically when you enter 6 digits',
        ja: '6桁の認証番号を入力すると自動的に認証されます',
        zh: '输入6位验证码后将自动验证',
        vi: 'Xác thực tự động khi bạn nhập đủ 6 số'
    },


    // 홈 페이지
    'home.title': {
        en: 'K-gency',
        ja: 'K-gency',
        zh: 'K-gency',
        vi: 'K-gency'
    },
    'home.recommended_jobs': {
        en: 'Recommended Jobs',
        ja: 'おすすめの仕事',
        zh: '推荐工作',
        vi: 'Công việc được đề xuất'
    },
    'home.total_postings': {
        en: 'Total {{count}} postings',
        ja: '全{{count}}件の求人',
        zh: '共{{count}}个职位',
        vi: 'Tổng cộng {{count}} tin tuyển dụng'
    },
    'home.matched_keywords': {
        en: 'Matched Keywords ({{count}})',
        ja: 'マッチしたキーワード ({{count}}個)',
        zh: '匹配关键词 ({{count}}个)',
        vi: 'Từ khóa phù hợp ({{count}})'
    },
    'home.no_matched_keywords': {
        en: 'No matched keywords',
        ja: 'マッチしたキーワードがありません',
        zh: '没有匹配的关键词',
        vi: 'Không có từ khóa phù hợp'
    },
    'home.applied': {
        en: 'Applied',
        ja: '応募済み',
        zh: '已申请',
        vi: 'Đã ứng tuyển'
    },
    'home.no_postings': {
        en: 'No matching job postings',
        ja: 'マッチする求人がありません',
        zh: '没有匹配的职位',
        vi: 'Không có tin tuyển dụng phù hợp'
    },
    'home.set_preferences': {
        en: 'Set Preferences',
        ja: '条件を設定する',
        zh: '设置条件',
        vi: 'Cài đặt điều kiện'
    },

    // 탭 메뉴
    'tab.home': {
        en: 'Home',
        ja: 'ホーム',
        zh: '首页',
        vi: 'Trang chủ'
    },
    'tab.my_posting': {
        en: 'My Posting',
        ja: '私の求人',
        zh: '我的求职',
        vi: 'Tin của tôi'
    },
    'tab.applications': {
        en: 'Applications',
        ja: '応募履歴',
        zh: '申请记录',
        vi: 'Đơn ứng tuyển'
    },
    'tab.settings': {
        en: 'Settings',
        ja: '設定',
        zh: '设置',
        vi: 'Cài đặt'
    },
    'tab.inbox': {
        en: 'Messages',
        ja: 'メッセージ',
        zh: '消息',
        vi: 'Tin nhắn'
    },
    'tab.job_postings': {
        en: 'My Postings',
        ja: '私の求人',
        zh: '我的招聘',
        vi: 'Tin tuyển dụng'
    },

    // 버튼/액션
    'button.back': {
        en: 'Back',
        ja: '戻る',
        zh: '返回',
        vi: 'Quay lại'
    },
    'button.save': {
        en: 'Save',
        ja: '保存',
        zh: '保存',
        vi: 'Lưu'
    },
    'button.next': {
        en: 'Next',
        ja: '次へ',
        zh: '下一步',
        vi: 'Tiếp theo'
    },
    'button.apply': {
        en: 'Apply',
        ja: '応募する',
        zh: '申请',
        vi: 'Ứng tuyển'
    },
    'button.edit': {
        en: 'Edit',
        ja: '編集',
        zh: '编辑',
        vi: 'Chỉnh sửa'
    },
    'button.delete': {
        en: 'Delete',
        ja: '削除',
        zh: '删除',
        vi: 'Xóa'
    },
    'button.cancel': {
        en: 'Cancel',
        ja: 'キャンセル',
        zh: '取消',
        vi: 'Hủy'
    },
    'button.confirm': {
        en: 'Confirm',
        ja: '確認',
        zh: '确认',
        vi: 'Xác nhận'
    },

    // 알림 메시지
    'alert.required_fields': {
        en: 'Please fill in all required fields',
        ja: '必須項目をすべて入力してください',
        zh: '请填写所有必填项',
        vi: 'Vui lòng điền đầy đủ thông tin bắt buộc'
    },
    'alert.success': {
        en: 'Success',
        ja: '成功',
        zh: '成功',
        vi: 'Thành công'
    },
    'alert.error': {
        en: 'Error',
        ja: 'エラー',
        zh: '错误',
        vi: 'Lỗi'
    },
    'alert.notification': {
        en: 'Notification',
        ja: 'お知らせ',
        zh: '通知',
        vi: 'Thông báo'
    }
};

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<string>('ko');
    const [dbCache, setDbCache] = useState<TranslationCache>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('appLanguage');
            if (savedLanguage) {
                setLanguage(savedLanguage);
                // DB 번역 캐시 로드
                const cache = await AsyncStorage.getItem(`translations_${savedLanguage}`);
                if (cache) {
                    setDbCache(JSON.parse(cache));
                }
            }
        } catch (error) {
            console.error('언어 설정 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeLanguage = async (newLanguage: string) => {
        try {
            await AsyncStorage.setItem('appLanguage', newLanguage);
            setLanguage(newLanguage);

            // 언어 변경 시 DB 캐시 로드
            if (newLanguage !== 'ko') {
                const cache = await AsyncStorage.getItem(`translations_${newLanguage}`);
                if (cache) {
                    setDbCache(JSON.parse(cache));
                } else {
                    // 캐시가 없으면 DB에서 로드
                    await preloadDBTranslations(newLanguage);
                }
            } else {
                setDbCache({});
            }
        } catch (error) {
            console.error('언어 변경 실패:', error);
        }
    };

    const preloadDBTranslations = async (lang: string) => {
        try {
            const { data } = await supabase
                .from('translations')
                .select('*')
                .eq('language', lang);

            if (data) {
                const cache: TranslationCache = {};
                data.forEach(item => {
                    const key = `${item.table_name}.${item.column_name}.${item.row_id}`;
                    cache[key] = item.translation;
                });

                setDbCache(cache);
                await AsyncStorage.setItem(
                    `translations_${lang}`,
                    JSON.stringify(cache)
                );
            }
        } catch (error) {
            console.error('DB 번역 로드 실패:', error);
        }
    };

    const t = (key: string, defaultText: string, variables?: { [key: string]: string | number }): string => {
        if (language === 'ko') {
            return replaceVariables(defaultText, variables);
        }

        let text = translations[key]?.[language] || defaultText;
        return replaceVariables(text, variables);
    };

    const replaceVariables = (text: string, variables?: { [key: string]: string | number }): string => {
        if (!variables) return text;

        let result = text;
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            result = result.replace(regex, String(variables[key]));
        });

        return result;
    };

    const translateDB = (tableName: string, columnName: string, rowId: string, defaultText: string): string => {
        if (language === 'ko') return defaultText;

        const key = `${tableName}.${columnName}.${rowId}`;
        return dbCache[key] || defaultText;
    };

    const value: TranslationContextType = {
        language,
        changeLanguage,
        t,
        translateDB,
        loading
    };

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
};