// 로그인 페이지

import {TranslationData} from "@/lib/translations/types";

export const loginTranslations: TranslationData = {
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
}
