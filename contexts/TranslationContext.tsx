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
    },

    // My Posting 페이지
    'myposting.title': {
        en: 'My Job Posting',
        ja: '私の求職公告',
        zh: '我的求职信息',
        vi: 'Tin tuyển dụng của tôi'
    },
    'myposting.activate_posting': {
        en: 'Activate Job Posting',
        ja: '求職公告の有効化',
        zh: '激活求职信息',
        vi: 'Kích hoạt tin tuyển dụng'
    },
    'myposting.activate_description': {
        en: 'When activated, companies can see your profile',
        ja: '有効化すると、企業があなたのプロフィールを閲覧できます',
        zh: '激活后，公司可以查看您的个人资料',
        vi: 'Khi kích hoạt, các công ty có thể xem hồ sơ của bạn'
    },
    'myposting.required_info_warning': {
        en: 'All required information must be entered to activate job posting',
        ja: '求職公告を有効化するには、すべての必須情報を入力する必要があります',
        zh: '必须填写所有必需信息才能激活求职信息',
        vi: 'Phải nhập đầy đủ thông tin bắt buộc để kích hoạt tin tuyển dụng'
    },
    'myposting.posting_active': {
        en: 'Job posting is activated',
        ja: '求職公告が有効化されています',
        zh: '求职信息已激活',
        vi: 'Tin tuyển dụng đã được kích hoạt'
    },
    'myposting.my_info': {
        en: 'My Information',
        ja: '私の情報',
        zh: '我的信息',
        vi: 'Thông tin của tôi'
    },
    'myposting.name': {
        en: 'Name',
        ja: '名前',
        zh: '姓名',
        vi: 'Họ tên'
    },
    'myposting.age': {
        en: 'Age',
        ja: '年齢',
        zh: '年龄',
        vi: 'Tuổi'
    },
    'myposting.gender': {
        en: 'Gender',
        ja: '性別',
        zh: '性别',
        vi: 'Giới tính'
    },
    'myposting.visa': {
        en: 'Visa',
        ja: 'ビザ',
        zh: '签证',
        vi: 'Visa'
    },
    'myposting.korean_level': {
        en: 'Korean Level',
        ja: '韓国語レベル',
        zh: '韩语水平',
        vi: 'Trình độ tiếng Hàn'
    },
    'myposting.not_entered': {
        en: 'Not entered',
        ja: '未入力',
        zh: '未输入',
        vi: 'Chưa nhập'
    },
    'myposting.matching_keywords': {
        en: 'My Matching Keywords',
        ja: '私のマッチングキーワード',
        zh: '我的匹配关键词',
        vi: 'Từ khóa phù hợp của tôi'
    },
    'myposting.no_keywords': {
        en: 'No keywords selected',
        ja: '選択されたキーワードがありません',
        zh: '没有选择关键词',
        vi: 'Chưa chọn từ khóa nào'
    },
    'myposting.edit_info': {
        en: 'Edit Information',
        ja: '情報を編集',
        zh: '编辑信息',
        vi: 'Chỉnh sửa thông tin'
    },
    'myposting.visa_type': {
        en: 'Visa Type',
        ja: 'ビザの種類',
        zh: '签证类型',
        vi: 'Loại visa'
    },
    'myposting.enter_name': {
        en: 'Enter your name',
        ja: '名前を入力してください',
        zh: '请输入姓名',
        vi: 'Nhập họ tên'
    },
    'myposting.enter_age': {
        en: 'Enter your age',
        ja: '年齢を入力してください',
        zh: '请输入年龄',
        vi: 'Nhập tuổi'
    },
    'myposting.select_gender': {
        en: 'Select gender',
        ja: '性別を選択してください',
        zh: '请选择性别',
        vi: 'Chọn giới tính'
    },
    'myposting.select_visa': {
        en: 'Select visa type',
        ja: 'ビザの種類を選択してください',
        zh: '请选择签证类型',
        vi: 'Chọn loại visa'
    },
    'myposting.required_info_title': {
        en: 'Required Information Needed',
        ja: '必須情報の入力が必要',
        zh: '需要填写必需信息',
        vi: 'Cần nhập thông tin bắt buộc'
    },
    'myposting.required_info_message': {
        en: 'Please enter all required information to activate job posting.',
        ja: '求職公告を有効化するには、すべての必須情報を入力してください。',
        zh: '请输入所有必需信息以激活求职信息。',
        vi: 'Vui lòng nhập đầy đủ thông tin bắt buộc để kích hoạt tin tuyển dụng.'
    },
    // 성별 옵션
    'myposting.gender_male': {
        en: 'Male',
        ja: '男性',
        zh: '男性',
        vi: 'Nam'
    },
    'myposting.gender_female': {
        en: 'Female',
        ja: '女性',
        zh: '女性',
        vi: 'Nữ'
    },
    'myposting.gender_other': {
        en: 'Other',
        ja: 'その他',
        zh: '其他',
        vi: 'Khác'
    },

// 비자 옵션
    'myposting.visa_f2': {
        en: 'F-2 (Residence)',
        ja: 'F-2 (居住ビザ)',
        zh: 'F-2 (居住签证)',
        vi: 'F-2 (Thị thực cư trú)'
    },
    'myposting.visa_f4': {
        en: 'F-4 (Overseas Korean)',
        ja: 'F-4 (在外同胞)',
        zh: 'F-4 (海外同胞)',
        vi: 'F-4 (Kiều bào)'
    },
    'myposting.visa_f5': {
        en: 'F-5 (Permanent Residence)',
        ja: 'F-5 (永住)',
        zh: 'F-5 (永久居留)',
        vi: 'F-5 (Thường trú nhân)'
    },
    'myposting.visa_f6': {
        en: 'F-6 (Marriage Migrant)',
        ja: 'F-6 (結婚移民)',
        zh: 'F-6 (结婚移民)',
        vi: 'F-6 (Kết hôn di trú)'
    },
    'myposting.visa_e9': {
        en: 'E-9 (Non-professional Employment)',
        ja: 'E-9 (非専門就業)',
        zh: 'E-9 (非专业就业)',
        vi: 'E-9 (Lao động phổ thông)'
    },
    'myposting.visa_h2': {
        en: 'H-2 (Working Visit)',
        ja: 'H-2 (訪問就業)',
        zh: 'H-2 (访问就业)',
        vi: 'H-2 (Thăm thân lao động)'
    },
    'myposting.visa_d2': {
        en: 'D-2 (Student)',
        ja: 'D-2 (留学)',
        zh: 'D-2 (留学)',
        vi: 'D-2 (Du học)'
    },
    'myposting.visa_d4': {
        en: 'D-4 (General Training)',
        ja: 'D-4 (一般研修)',
        zh: 'D-4 (一般研修)',
        vi: 'D-4 (Tu nghiệp tổng hợp)'
    },
    'myposting.visa_other': {
        en: 'Other',
        ja: 'その他',
        zh: '其他',
        vi: 'Khác'
    },
// 한국어 레벨 옵션
    'myposting.korean_beginner': {
        en: 'Beginner',
        ja: '初級',
        zh: '初级',
        vi: 'Sơ cấp'
    },
    'myposting.korean_intermediate': {
        en: 'Intermediate',
        ja: '中級',
        zh: '中级',
        vi: 'Trung cấp'
    },
    'myposting.korean_advanced': {
        en: 'Advanced',
        ja: '上級',
        zh: '高级',
        vi: 'Cao cấp'
    },


    // Applications 페이지
    'applications.title': {
        en: 'Application History',
        ja: '応募履歴',
        zh: '申请记录',
        vi: 'Lịch sử ứng tuyển'
    },
    'applications.total_applications': {
        en: 'Total {{count}} applications',
        ja: '全{{count}}件の応募',
        zh: '共{{count}}个申请',
        vi: 'Tổng cộng {{count}} đơn ứng tuyển'
    },
    'applications.filter_all': {
        en: 'All',
        ja: '全て',
        zh: '全部',
        vi: 'Tất cả'
    },
    'applications.filter_pending': {
        en: 'Under Review',
        ja: '検討中',
        zh: '审核中',
        vi: 'Đang xét duyệt'
    },
    'applications.filter_reviewed': {
        en: 'Reviewed',
        ja: '検討完了',
        zh: '已审核',
        vi: 'Đã xét duyệt'
    },
    'applications.status_pending': {
        en: 'Under Review',
        ja: '検討中',
        zh: '审核中',
        vi: 'Đang xét duyệt'
    },
    'applications.status_reviewed': {
        en: 'Reviewed',
        ja: '検討完了',
        zh: '已审核',
        vi: 'Đã xét duyệt'
    },
    'applications.status_accepted': {
        en: 'Accepted',
        ja: '合格',
        zh: '已录取',
        vi: 'Đã trúng tuyển'
    },
    'applications.status_rejected': {
        en: 'Rejected',
        ja: '不合格',
        zh: '未录取',
        vi: 'Không trúng tuyển'
    },
    'applications.applied_date': {
        en: 'Applied',
        ja: '応募日',
        zh: '申请日期',
        vi: 'Ngày ứng tuyển'
    },
    'applications.closed': {
        en: 'Closed',
        ja: '募集終了',
        zh: '已结束',
        vi: 'Đã đóng'
    },
    'applications.view_resume': {
        en: 'View Submitted Resume',
        ja: '提出した履歴書を見る',
        zh: '查看提交的简历',
        vi: 'Xem hồ sơ đã nộp'
    },
    'applications.no_applications': {
        en: 'No applications yet',
        ja: 'まだ応募した求人がありません',
        zh: '还没有申请的职位',
        vi: 'Chưa có đơn ứng tuyển nào'
    },
    'applications.no_pending': {
        en: 'No applications under review',
        ja: '検討中の応募がありません',
        zh: '没有审核中的申请',
        vi: 'Không có đơn đang xét duyệt'
    },
    'applications.no_reviewed': {
        en: 'No reviewed applications',
        ja: '検討完了した応募がありません',
        zh: '没有已审核的申请',
        vi: 'Không có đơn đã xét duyệt'
    },
    'applications.go_to_postings': {
        en: 'Browse Jobs',
        ja: '求人を見る',
        zh: '查看职位',
        vi: 'Xem tin tuyển dụng'
    },
    'applications.today': {
        en: 'Today',
        ja: '今日',
        zh: '今天',
        vi: 'Hôm nay'
    },
    'applications.yesterday': {
        en: 'Yesterday',
        ja: '昨日',
        zh: '昨天',
        vi: 'Hôm qua'
    },
    'applications.days_ago': {
        en: '{{days}} days ago',
        ja: '{{days}}日前',
        zh: '{{days}}天前',
        vi: '{{days}} ngày trước'
    },
    'applications.loading': {
        en: 'Loading...',
        ja: '読み込み中...',
        zh: '加载中...',
        vi: 'Đang tải...'
    },


    // Settings 페이지
    'settings.title': {
        en: 'Settings',
        ja: '設定',
        zh: '设置',
        vi: 'Cài đặt'
    },
    'settings.no_name': {
        en: 'No Name',
        ja: '名前なし',
        zh: '未设置姓名',
        vi: 'Chưa có tên'
    },
    'settings.edit_profile': {
        en: 'Edit Profile',
        ja: 'プロフィール編集',
        zh: '编辑个人资料',
        vi: 'Chỉnh sửa hồ sơ'
    },
    'settings.notification_settings': {
        en: 'Notification Settings',
        ja: '通知設定',
        zh: '通知设置',
        vi: 'Cài đặt thông báo'
    },
    'settings.new_job_notification': {
        en: 'New Job Alerts',
        ja: '新しい仕事の通知',
        zh: '新工作提醒',
        vi: 'Thông báo việc mới'
    },
    'settings.new_job_description': {
        en: 'Notifications for matching jobs',
        ja: 'マッチする求人の通知',
        zh: '匹配职位的通知',
        vi: 'Thông báo công việc phù hợp'
    },
    'settings.application_status_notification': {
        en: 'Application Status Alerts',
        ja: '応募状況の通知',
        zh: '申请状态提醒',
        vi: 'Thông báo tình trạng ứng tuyển'
    },
    'settings.application_status_description': {
        en: 'Application status change notifications',
        ja: '応募状態変更の通知',
        zh: '申请状态变更通知',
        vi: 'Thông báo thay đổi trạng thái ứng tuyển'
    },
    'settings.marketing_notification': {
        en: 'Marketing Notifications',
        ja: 'マーケティング通知',
        zh: '营销通知',
        vi: 'Thông báo tiếp thị'
    },
    'settings.marketing_description': {
        en: 'Event and benefit information',
        ja: 'イベント・特典情報',
        zh: '活动和优惠信息',
        vi: 'Thông tin sự kiện và ưu đãi'
    },
    'settings.app_settings': {
        en: 'App Settings',
        ja: 'アプリ設定',
        zh: '应用设置',
        vi: 'Cài đặt ứng dụng'
    },
    'settings.language_settings': {
        en: 'Language Settings',
        ja: '言語設定',
        zh: '语言设置',
        vi: 'Cài đặt ngôn ngữ'
    },
    'settings.information': {
        en: 'Information',
        ja: '情報',
        zh: '信息',
        vi: 'Thông tin'
    },
    'settings.terms_of_service': {
        en: 'Terms of Service',
        ja: '利用規約',
        zh: '服务条款',
        vi: 'Điều khoản sử dụng'
    },
    'settings.privacy_policy': {
        en: 'Privacy Policy',
        ja: 'プライバシーポリシー',
        zh: '隐私政策',
        vi: 'Chính sách bảo mật'
    },
    'settings.customer_service': {
        en: 'Customer Service',
        ja: 'カスタマーサービス',
        zh: '客服中心',
        vi: 'Dịch vụ khách hàng'
    },
    'settings.app_version': {
        en: 'App Version',
        ja: 'アプリバージョン',
        zh: '应用版本',
        vi: 'Phiên bản ứng dụng'
    },
    'settings.account_management': {
        en: 'Account Management',
        ja: 'アカウント管理',
        zh: '账户管理',
        vi: 'Quản lý tài khoản'
    },
    'settings.logout': {
        en: 'Logout',
        ja: 'ログアウト',
        zh: '退出登录',
        vi: 'Đăng xuất'
    },
    'settings.delete_account': {
        en: 'Delete Account',
        ja: '退会',
        zh: '注销账户',
        vi: 'Xóa tài khoản'
    },
    'settings.logout_confirm': {
        en: 'Are you sure you want to logout?',
        ja: '本当にログアウトしますか？',
        zh: '确定要退出登录吗？',
        vi: 'Bạn có chắc muốn đăng xuất?'
    },
    'settings.error': {
        en: 'Error',
        ja: 'エラー',
        zh: '错误',
        vi: 'Lỗi'
    },
    'settings.auth_not_found': {
        en: 'Authentication information not found.',
        ja: '認証情報が見つかりません。',
        zh: '找不到认证信息。',
        vi: 'Không tìm thấy thông tin xác thực.'
    },
    'settings.delete_complete': {
        en: 'Account Deleted',
        ja: '退会完了',
        zh: '注销完成',
        vi: 'Đã xóa tài khoản'
    },
    'settings.thank_you': {
        en: 'Thank you for using our service.',
        ja: 'ご利用ありがとうございました。',
        zh: '感谢您使用我们的服务。',
        vi: 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.'
    },
    'settings.delete_error': {
        en: 'An error occurred while deleting your account.',
        ja: '退会処理中に問題が発生しました。',
        zh: '注销账户时出现问题。',
        vi: 'Đã xảy ra lỗi khi xóa tài khoản.'
    },
    'settings.language_change': {
        en: 'Language Changed',
        ja: '言語変更',
        zh: '语言更改',
        vi: 'Đã thay đổi ngôn ngữ'
    },
    'settings.restart_required': {
        en: 'Please restart the app to apply changes.',
        ja: 'アプリを再起動すると適用されます。',
        zh: '请重启应用以应用更改。',
        vi: 'Vui lòng khởi động lại ứng dụng để áp dụng thay đổi.'
    },
    'settings.customer_service_info': {
        en: 'Have questions?\nCustomer Service: 1588-0000\nHours: Weekdays 09:00 - 18:00',
        ja: 'お問い合わせはこちら\nカスタマーセンター: 1588-0000\n営業時間: 平日 09:00 - 18:00',
        zh: '有疑问吗？\n客服中心：1588-0000\n工作时间：工作日 09:00 - 18:00',
        vi: 'Có thắc mắc?\nTổng đài: 1588-0000\nGiờ làm việc: Thứ 2-6, 09:00 - 18:00'
    },
    'settings.select_language': {
        en: 'Select Language',
        ja: '言語を選択',
        zh: '选择语言',
        vi: 'Chọn ngôn ngữ'
    },
    'settings.delete_confirm_title': {
        en: 'Are you sure you want to delete your account?',
        ja: '本当に退会しますか？',
        zh: '确定要注销账户吗？',
        vi: 'Bạn có chắc muốn xóa tài khoản?'
    },
    'settings.delete_warning': {
        en: 'All data will be deleted and cannot be recovered.',
        ja: '全てのデータが削除され\n復元できません。',
        zh: '所有数据将被删除\n且无法恢复。',
        vi: 'Tất cả dữ liệu sẽ bị xóa\nvà không thể khôi phục.'
    },
    'settings.delete_button': {
        en: 'Delete Account',
        ja: '退会する',
        zh: '注销账户',
        vi: 'Xóa tài khoản'
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