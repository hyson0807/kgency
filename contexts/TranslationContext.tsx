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
    'start.select_type': {
        en: 'Which service would you like to use?',
        ja: 'どのサービスをご利用になりますか？',
        zh: '您想使用哪种服务？',
        vi: 'Bạn muốn sử dụng dịch vụ nào?'
    },
    'start.job_seeker': {
        en: 'Job Seeker',
        ja: '求職者',
        zh: '求职者',
        vi: 'Người tìm việc'
    },
    'start.job_seeker_desc': {
        en: 'Looking for a job?\nWe\'ll recommend perfect matches',
        ja: '仕事をお探しですか？\nぴったりの仕事をご紹介します',
        zh: '正在找工作吗？\n我们会推荐合适的工作',
        vi: 'Đang tìm việc làm?\nChúng tôi sẽ giới thiệu việc phù hợp'
    },
    'start.employer': {
        en: 'Employer',
        ja: '求人者',
        zh: '雇主',
        vi: 'Nhà tuyển dụng'
    },
    'start.employer_desc': {
        en: 'Looking for employees?\nWe\'ll match you with talent',
        ja: '従業員をお探しですか？\n人材をマッチングします',
        zh: '正在招聘员工吗？\n我们会为您匹配人才',
        vi: 'Đang tìm nhân viên?\nChúng tôi sẽ kết nối nhân tài'
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
    },


    // Posting Detail 페이지
    'posting_detail.title': {
        en: 'Job Details',
        ja: '採用詳細',
        zh: '招聘详情',
        vi: 'Chi tiết tuyển dụng'
    },
    'posting_detail.not_found': {
        en: 'Job posting not found.',
        ja: '求人が見つかりません。',
        zh: '找不到招聘信息。',
        vi: 'Không tìm thấy tin tuyển dụng.'
    },
    'posting_detail.company_intro': {
        en: 'About Company',
        ja: '会社紹介',
        zh: '公司介绍',
        vi: 'Giới thiệu công ty'
    },
    'posting_detail.work_conditions': {
        en: 'Working Conditions',
        ja: '勤務条件',
        zh: '工作条件',
        vi: 'Điều kiện làm việc'
    },
    'posting_detail.work_location': {
        en: 'Work Location',
        ja: '勤務地',
        zh: '工作地点',
        vi: 'Địa điểm làm việc'
    },
    'posting_detail.work_days': {
        en: 'Working Days',
        ja: '勤務日',
        zh: '工作日',
        vi: 'Ngày làm việc'
    },
    'posting_detail.work_hours': {
        en: 'Working Hours',
        ja: '勤務時間',
        zh: '工作时间',
        vi: 'Giờ làm việc'
    },
    'posting_detail.salary': {
        en: 'Salary',
        ja: '給与',
        zh: '薪资',
        vi: 'Lương'
    },
    'posting_detail.pay_day': {
        en: 'Pay Day',
        ja: '給料日',
        zh: '发薪日',
        vi: 'Ngày trả lương'
    },
    'posting_detail.negotiable': {
        en: ' (Negotiable)',
        ja: ' (協議可能)',
        zh: ' (可协商)',
        vi: ' (Có thể thương lượng)'
    },
    'posting_detail.hiring_count': {
        en: 'Positions',
        ja: '募集人数',
        zh: '招聘人数',
        vi: 'Số lượng tuyển'
    },
    'posting_detail.people': {
        en: ' people',
        ja: '名',
        zh: '人',
        vi: ' người'
    },
    'posting_detail.detail_description': {
        en: 'Job Description',
        ja: '詳細説明',
        zh: '详细说明',
        vi: 'Mô tả chi tiết'
    },
    'posting_detail.company_benefits': {
        en: 'Company Benefits!',
        ja: '会社の強み！',
        zh: '公司优势！',
        vi: 'Điểm mạnh của công ty!'
    },
    'posting_detail.hiring_fields': {
        en: 'Hiring Fields',
        ja: '採用分野',
        zh: '招聘领域',
        vi: 'Lĩnh vực tuyển dụng'
    },
    'posting_detail.target_countries': {
        en: 'Target Countries',
        ja: '対象国',
        zh: '目标国家',
        vi: 'Quốc gia mục tiêu'
    },
    'posting_detail.job_positions': {
        en: 'Job Positions',
        ja: '募集職種',
        zh: '招聘职位',
        vi: 'Vị trí tuyển dụng'
    },
    'posting_detail.already_applied': {
        en: 'Already Applied',
        ja: 'すでに応募済み',
        zh: '已申请',
        vi: 'Đã ứng tuyển'
    },
    'posting_detail.apply': {
        en: 'Apply Now',
        ja: '応募する',
        zh: '立即申请',
        vi: 'Ứng tuyển ngay'
    },



    // Apply 페이지
    'apply.title': {
        en: 'Application Form',
        ja: '応募書作成',
        zh: '申请表',
        vi: 'Đơn ứng tuyển'
    },
    'apply.applying_to': {
        en: 'Applying to',
        ja: '応募先',
        zh: '申请职位',
        vi: 'Ứng tuyển vào'
    },
    'apply.job_posting': {
        en: 'Job Posting',
        ja: '求人',
        zh: '招聘信息',
        vi: 'Tin tuyển dụng'
    },
    'apply.already_applied_warning': {
        en: 'You have already applied to this job',
        ja: 'すでに応募済みです',
        zh: '您已申请过此职位',
        vi: 'Bạn đã ứng tuyển công việc này'
    },
    'apply.basic_info': {
        en: 'Basic Information',
        ja: '基本情報',
        zh: '基本信息',
        vi: 'Thông tin cơ bản'
    },
    'apply.name': {
        en: 'Name',
        ja: '名前',
        zh: '姓名',
        vi: 'Họ tên'
    },
    'apply.enter_name': {
        en: 'Enter your name',
        ja: '名前を入力してください',
        zh: '请输入姓名',
        vi: 'Nhập họ tên'
    },
    'apply.age': {
        en: 'Age',
        ja: '年齢',
        zh: '年龄',
        vi: 'Tuổi'
    },
    'apply.gender': {
        en: 'Gender',
        ja: '性別',
        zh: '性别',
        vi: 'Giới tính'
    },
    'apply.select': {
        en: 'Select',
        ja: '選択',
        zh: '选择',
        vi: 'Chọn'
    },
    'apply.visa_type': {
        en: 'Visa Type',
        ja: 'ビザの種類',
        zh: '签证类型',
        vi: 'Loại visa'
    },
    'apply.select_visa': {
        en: 'Select visa type',
        ja: 'ビザの種類を選択',
        zh: '选择签证类型',
        vi: 'Chọn loại visa'
    },
    'apply.career_info': {
        en: 'Career Information',
        ja: '経歴情報',
        zh: '工作经历',
        vi: 'Thông tin nghề nghiệp'
    },
    'apply.desired_period': {
        en: 'Desired Work Period',
        ja: '希望勤務期間',
        zh: '希望工作期限',
        vi: 'Thời gian làm việc mong muốn'
    },
    'apply.related_experience': {
        en: 'Related Experience',
        ja: '関連経験',
        zh: '相关经验',
        vi: 'Kinh nghiệm liên quan'
    },
    'apply.experience_detail': {
        en: 'Experience Details',
        ja: '経歴内容',
        zh: '经历详情',
        vi: 'Chi tiết kinh nghiệm'
    },
    'apply.enter_experience': {
        en: 'Enter brief work experience',
        ja: '簡単な経歴内容を入力してください',
        zh: '请输入简要工作经历',
        vi: 'Nhập kinh nghiệm làm việc ngắn gọn'
    },
    'apply.korean_level': {
        en: 'Korean Level',
        ja: '韓国語レベル',
        zh: '韩语水平',
        vi: 'Trình độ tiếng Hàn'
    },
    'apply.topik_level': {
        en: 'TOPIK Level',
        ja: 'TOPIK級',
        zh: 'TOPIK等级',
        vi: 'Cấp độ TOPIK'
    },
    'apply.questions': {
        en: 'Questions for Employer',
        ja: '社長への質問',
        zh: '想问老板的问题',
        vi: 'Câu hỏi cho nhà tuyển dụng'
    },
    'apply.questions_placeholder': {
        en: 'Questions',
        ja: '質問事項',
        zh: '问题',
        vi: 'Câu hỏi'
    },
    'apply.saving': {
        en: 'Saving...',
        ja: '保存中...',
        zh: '保存中...',
        vi: 'Đang lưu...'
    },
    'apply.create_resume': {
        en: 'Auto-create Resume!',
        ja: '履歴書を自動作成します！',
        zh: '自动生成简历！',
        vi: 'Tự động tạo hồ sơ!'
    },
    'apply.name_required': {
        en: 'Name is required',
        ja: '名前は必須入力項目です',
        zh: '姓名为必填项',
        vi: 'Họ tên là bắt buộc'
    },
    'apply.invalid_age': {
        en: 'Please enter a valid age',
        ja: '正しい年齢を入力してください',
        zh: '请输入有效年龄',
        vi: 'Vui lòng nhập tuổi hợp lệ'
    },
    'apply.already_applied_title': {
        en: 'Already Applied',
        ja: 'すでに応募済み',
        zh: '已申请',
        vi: 'Đã ứng tuyển'
    },
    'apply.already_applied_message': {
        en: 'You have already applied to this job. Do you want to rewrite your resume?',
        ja: 'この求人にはすでに応募しています。それでも履歴書を再作成しますか？',
        zh: '您已申请过此职位。是否要重新编写简历？',
        vi: 'Bạn đã ứng tuyển công việc này. Bạn có muốn viết lại hồ sơ không?'
    },
    'apply.save_failed': {
        en: 'Failed to save information',
        ja: '情報の保存に失敗しました',
        zh: '保存信息失败',
        vi: 'Lưu thông tin thất bại'
    },
    'apply.save_error': {
        en: 'An error occurred while saving',
        ja: '保存中に問題が発生しました',
        zh: '保存时出现问题',
        vi: 'Đã xảy ra lỗi khi lưu'
    },

// 성별 옵션
    'apply.gender_male': {
        en: 'Male',
        ja: '男性',
        zh: '男性',
        vi: 'Nam'
    },
    'apply.gender_female': {
        en: 'Female',
        ja: '女性',
        zh: '女性',
        vi: 'Nữ'
    },
    'apply.gender_other': {
        en: 'Other',
        ja: 'その他',
        zh: '其他',
        vi: 'Khác'
    },

// 근무 기간
    'apply.period_1month': {
        en: '1 month',
        ja: '1ヶ月',
        zh: '1个月',
        vi: '1 tháng'
    },
    'apply.period_3months': {
        en: '3 months',
        ja: '3ヶ月',
        zh: '3个月',
        vi: '3 tháng'
    },
    'apply.period_6months': {
        en: '6 months',
        ja: '6ヶ月',
        zh: '6个月',
        vi: '6 tháng'
    },
    'apply.period_1year': {
        en: '1 year',
        ja: '1年',
        zh: '1年',
        vi: '1 năm'
    },
    'apply.period_long': {
        en: 'Long-term',
        ja: '長期',
        zh: '长期',
        vi: 'Dài hạn'
    },

// 경력
    'apply.exp_none': {
        en: 'No experience',
        ja: '初めて',
        zh: '无经验',
        vi: 'Chưa có kinh nghiệm'
    },
    'apply.exp_1month': {
        en: '1 month',
        ja: '1ヶ月',
        zh: '1个月',
        vi: '1 tháng'
    },
    'apply.exp_6months': {
        en: '6 months',
        ja: '6ヶ月',
        zh: '6个月',
        vi: '6 tháng'
    },
    'apply.exp_1year': {
        en: '1 year',
        ja: '1年',
        zh: '1年',
        vi: '1 năm'
    },
    'apply.exp_3years': {
        en: '3+ years',
        ja: '3年以上',
        zh: '3年以上',
        vi: '3 năm trở lên'
    },

// 한국어 레벨
    'apply.korean_beginner': {
        en: 'Beginner',
        ja: '初級',
        zh: '初级',
        vi: 'Sơ cấp'
    },
    'apply.korean_intermediate': {
        en: 'Intermediate',
        ja: '中級',
        zh: '中级',
        vi: 'Trung cấp'
    },
    'apply.korean_advanced': {
        en: 'Advanced',
        ja: '上級',
        zh: '高级',
        vi: 'Cao cấp'
    },

// TOPIK 레벨
    'apply.topik_1': {
        en: 'Level 1',
        ja: '1級',
        zh: '1级',
        vi: 'Cấp 1'
    },
    'apply.topik_2': {
        en: 'Level 2',
        ja: '2級',
        zh: '2级',
        vi: 'Cấp 2'
    },
    'apply.topik_3plus': {
        en: 'Level 3+',
        ja: '3級以上',
        zh: '3级以上',
        vi: 'Cấp 3 trở lên'
    },
    // 비자 종류
    'apply.visa_f2': {
        en: 'F-2 (Residence)',
        ja: 'F-2 (居住ビザ)',
        zh: 'F-2 (居住签证)',
        vi: 'F-2 (Thị thực cư trú)'
    },
    'apply.visa_f4': {
        en: 'F-4 (Overseas Korean)',
        ja: 'F-4 (在外同胞)',
        zh: 'F-4 (海外同胞)',
        vi: 'F-4 (Kiều bào)'
    },
    'apply.visa_f5': {
        en: 'F-5 (Permanent Residence)',
        ja: 'F-5 (永住)',
        zh: 'F-5 (永久居留)',
        vi: 'F-5 (Thường trú nhân)'
    },
    'apply.visa_f6': {
        en: 'F-6 (Marriage Migrant)',
        ja: 'F-6 (結婚移民)',
        zh: 'F-6 (结婚移民)',
        vi: 'F-6 (Kết hôn di trú)'
    },
    'apply.visa_e9': {
        en: 'E-9 (Non-professional Employment)',
        ja: 'E-9 (非専門就業)',
        zh: 'E-9 (非专业就业)',
        vi: 'E-9 (Lao động phổ thông)'
    },
    'apply.visa_h2': {
        en: 'H-2 (Working Visit)',
        ja: 'H-2 (訪問就業)',
        zh: 'H-2 (访问就业)',
        vi: 'H-2 (Thăm thân lao động)'
    },
    'apply.visa_d2': {
        en: 'D-2 (Student)',
        ja: 'D-2 (留学)',
        zh: 'D-2 (留学)',
        vi: 'D-2 (Du học)'
    },
    'apply.visa_d4': {
        en: 'D-4 (General Training)',
        ja: 'D-4 (一般研修)',
        zh: 'D-4 (一般研修)',
        vi: 'D-4 (Tu nghiệp tổng hợp)'
    },
    'apply.visa_other': {
        en: 'Other',
        ja: 'その他',
        zh: '其他',
        vi: 'Khác'
    },





    // Resume 페이지
    'resume.title': {
        en: 'Resume',
        ja: '履歴書',
        zh: '简历',
        vi: 'Hồ sơ'
    },
    'resume.creating': {
        en: 'Creating your resume...',
        ja: '履歴書を作成中です...',
        zh: '正在生成简历...',
        vi: 'Đang tạo hồ sơ...'
    },
    'resume.no_posting_info': {
        en: 'Job posting information not found.',
        ja: '求人情報がありません。',
        zh: '没有招聘信息。',
        vi: 'Không có thông tin tuyển dụng.'
    },
    'resume.no_company_info': {
        en: 'Company information not found.',
        ja: '会社情報がありません。',
        zh: '没有公司信息。',
        vi: 'Không có thông tin công ty.'
    },
    'resume.login_required': {
        en: 'Login required.',
        ja: 'ログインが必要です。',
        zh: '需要登录。',
        vi: 'Cần đăng nhập.'
    },
    'resume.ai_generation_failed': {
        en: 'Failed to generate AI resume.',
        ja: 'AI履歴書の生成に失敗しました。',
        zh: 'AI简历生成失败。',
        vi: 'Tạo hồ sơ AI thất bại.'
    },
    'resume.ai_generation_error': {
        en: 'An error occurred while generating AI resume.',
        ja: 'AI履歴書生成中にエラーが発生しました。',
        zh: 'AI简历生成时出错。',
        vi: 'Đã xảy ra lỗi khi tạo hồ sơ AI.'
    },
    'resume.job_posting': {
        en: 'Job Posting',
        ja: '求人',
        zh: '招聘信息',
        vi: 'Tin tuyển dụng'
    },
    'resume.customized_resume': {
        en: 'Customized Resume',
        ja: 'カスタマイズ履歴書',
        zh: '定制简历',
        vi: 'Hồ sơ tùy chỉnh'
    },
    'resume.enter_content': {
        en: 'Enter resume content...',
        ja: '履歴書の内容を入力してください...',
        zh: '请输入简历内容...',
        vi: 'Nhập nội dung hồ sơ...'
    },
    'resume.ai_info': {
        en: 'This resume is created based on the information you provided',
        ja: '入力された情報に基づいて作成された履歴書です',
        zh: '这份简历是根据您提供的信息生成的',
        vi: 'Hồ sơ này được tạo dựa trên thông tin bạn cung cấp'
    },
    'resume.edit_info': {
        en: 'Review and edit if necessary. Click the edit button at the top to make changes.',
        ja: '内容を確認し、必要に応じて修正できます。編集するには上部の編集ボタンを押してください。',
        zh: '请检查内容，如需修改请点击顶部的编辑按钮。',
        vi: 'Xem lại và chỉnh sửa nếu cần. Nhấn nút chỉnh sửa ở trên để thay đổi.'
    },
    'resume.sending': {
        en: 'Sending...',
        ja: '送信中...',
        zh: '发送中...',
        vi: 'Đang gửi...'
    },
    'resume.complete_edit': {
        en: 'Complete editing first',
        ja: '編集を完了してください',
        zh: '请先完成编辑',
        vi: 'Hoàn thành chỉnh sửa trước'
    },
    'resume.send_resume': {
        en: 'Send Resume',
        ja: '履歴書を送信',
        zh: '发送简历',
        vi: 'Gửi hồ sơ'
    },
    'resume.send_modal_title': {
        en: 'Send Resume',
        ja: '履歴書送信',
        zh: '发送简历',
        vi: 'Gửi hồ sơ'
    },
    'resume.send_modal_message': {
        en: 'Send your resume to {{jobTitle}}?',
        ja: '{{jobTitle}}に履歴書を送信しますか？',
        zh: '向{{jobTitle}}发送简历吗？',
        vi: 'Gửi hồ sơ đến {{jobTitle}}?'
    },
    'resume.regenerate_modal_title': {
        en: 'Regenerate Resume',
        ja: '履歴書再生成',
        zh: '重新生成简历',
        vi: 'Tạo lại hồ sơ'
    },
    'resume.regenerate_modal_message': {
        en: 'Current content will be lost. Continue?',
        ja: '現在作成された内容が消えます。続けますか？',
        zh: '当前内容将丢失。是否继续？',
        vi: 'Nội dung hiện tại sẽ bị mất. Tiếp tục?'
    },
    'resume.application_subject': {
        en: '[{{job}}] Job Application',
        ja: '[{{job}}] 入社志願書',
        zh: '[{{job}}] 入职申请',
        vi: '[{{job}}] Đơn ứng tuyển'
    },




    // Info 페이지
    'info.title': {
        en: 'Set Preferences',
        ja: '希望条件設定',
        zh: '设置工作条件',
        vi: 'Cài đặt điều kiện mong muốn'
    },
    'info.desired_location': {
        en: 'Desired Work Location',
        ja: '希望勤務地',
        zh: '希望工作地点',
        vi: 'Địa điểm làm việc mong muốn'
    },
    'info.select_location': {
        en: 'Select location',
        ja: '地域を選択してください',
        zh: '请选择地区',
        vi: 'Chọn khu vực'
    },
    'info.country': {
        en: 'Country',
        ja: '国',
        zh: '国家',
        vi: 'Quốc gia'
    },
    'info.select_country': {
        en: 'Select country',
        ja: '国を選択してください',
        zh: '请选择国家',
        vi: 'Chọn quốc gia'
    },
    'info.search': {
        en: 'Search...',
        ja: '検索...',
        zh: '搜索...',
        vi: 'Tìm kiếm...'
    },
    'info.save': {
        en: 'Save',
        ja: '保存',
        zh: '保存',
        vi: 'Lưu'
    },
    'info.select_location_required': {
        en: 'Please select a location',
        ja: '地域を選択してください',
        zh: '请选择地区',
        vi: 'Vui lòng chọn khu vực'
    },
    'info.select_country_required': {
        en: 'Please select a country',
        ja: '国を選択してください',
        zh: '请选择国家',
        vi: 'Vui lòng chọn quốc gia'
    },
    // 국가 선택 섹션
    'info.location_no_preference': {
        en: 'No Preference',
        ja: '指定なし',
        zh: '不限',
        vi: 'Không quan trọng'
    },


    // JobPreferencesSelector
    'job_selector.title': {
        en: 'Desired Jobs',
        ja: '希望職種',
        zh: '希望职位',
        vi: 'Công việc mong muốn'
    },

// WorkConditionsSelector
    'work_conditions_selector.title': {
        en: 'Desired Benefits',
        ja: '希望する待遇',
        zh: '期望福利',
        vi: 'Phúc lợi mong muốn'
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