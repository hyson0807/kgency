import {Text, TouchableOpacity, View} from "react-native";
import Back from "@/components/back";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
interface HeaderProps {
    language: string;
    handleTranslate: () => Promise<void>;
    isTranslated: boolean;
    isTranslating: boolean;
    t: (key: string, defaultValue: string) => string;
}
export const Header = ({
    language,
    handleTranslate,
    isTranslated,
    isTranslating,
    t
}: HeaderProps) => (
    <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <View className="flex-row items-center">
            <Back />
            <Text className="text-lg font-bold ml-4">{t('posting_detail.title', '채용 상세')}</Text>
        </View>
        {language !== 'ko' && ( // 한국어가 아닐 때만 번역 버튼 표시
            <TouchableOpacity
                onPress={handleTranslate}
                disabled={isTranslating}
                className={`flex-row items-center px-3 py-1.5 rounded-full ${
                    isTranslated ? 'bg-green-100' : 'bg-blue-100'
                }`}
            >
                <Ionicons
                    name={isTranslated ? "checkmark-circle" : "language"}
                    size={16}
                    color={isTranslated ? "#10b981" : "#3b82f6"}
                />
                <Text className={`ml-1 text-sm ${
                    isTranslated ? 'text-green-600' : 'text-blue-600'
                }`}>
                    {isTranslated ? t('posting_detail.show_original', '원본 보기') : t('posting_detail.translate', '번역하기')}
                </Text>
            </TouchableOpacity>
        )}
    </View>
)
export default Header;