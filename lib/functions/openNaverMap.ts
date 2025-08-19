import { Linking, Platform } from "react-native";
interface OpenNaverMapOptions {
    onError?: () => void;
}
const openNaverMap = async (address: string, options?: OpenNaverMapOptions) => {
    // 주소를 URL 인코딩
    const encodedAddress = encodeURIComponent(address);
    // 웹에서 실행 중인지 확인
    if (Platform.OS === 'web') {
        // 웹에서는 앵커 태그를 생성하여 네이버 지도 열기
        const naverMapUrl = `https://map.naver.com/v5/search/${encodedAddress}`;
        // 임시 앵커 태그 생성
        const link = document.createElement('a');
        link.href = naverMapUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        // DOM에 추가하지 않고 바로 클릭 이벤트 발생
        link.click();
        return;
    }
    // 모바일에서는 네이버 지도 앱 또는 웹으로 열기
    try {
        // 네이버 지도 앱 URL 스키마
        const naverAppUrl = `nmap://search?query=${encodedAddress}&appname=com.example.yourapp`;
        // 네이버 지도 앱이 설치되어 있는지 확인
        const canOpenApp = await Linking.canOpenURL(naverAppUrl);
        if (canOpenApp) {
            // 네이버 지도 앱으로 열기
            await Linking.openURL(naverAppUrl);
        } else {
            // 네이버 지도 앱이 없으면 웹으로 열기
            const naverWebUrl = `https://map.naver.com/v5/search/${encodedAddress}`;
            await Linking.openURL(naverWebUrl);
        }
    } catch (error) {
        // 에러 발생 시 웹으로 열기 시도
        try {
            const naverWebUrl = `https://map.naver.com/v5/search/${encodedAddress}`;
            await Linking.openURL(naverWebUrl);
        } catch (webError) {
            // 모든 시도가 실패한 경우 콜백 호출
            if (options?.onError) {
                options.onError();
            }
        }
    }
};
export default openNaverMap;