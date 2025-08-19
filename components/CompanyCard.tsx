import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
interface CompanyCardProps {
    company: {
        id: string;
        name: string;
        description?: string;
        address?: string;
    };
    matchedCount: number;
    matchedKeywords: {
        countries: string[];
        jobs: string[];
        conditions: string[];
    };
    onPress?: () => void;
    hasApplied?: boolean;
}
const CompanyCard: React.FC<CompanyCardProps> = ({
                                                     company,
                                                     matchedCount,
                                                     matchedKeywords,
                                                     onPress,
                                                     hasApplied = false
                                                 }) => {
    const hasMatches = matchedCount > 0;
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm relative"
            activeOpacity={0.7}
        >
            {/* 지원 완료 뱃지 - 추가된 부분 */}
            {hasApplied && (
                <View className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <Text className="text-white text-xs font-medium ml-1">지원완료</Text>
                </View>
            )}
            {/* 회사 정보 */}
            <View className="mb-3">
                <Text className="text-lg font-bold text-gray-800 pr-20">
                    {company.name}
                </Text>
                {company.address && (
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-1">
                            {company.address}
                        </Text>
                    </View>
                )}
            </View>
            {company.description && (
                <Text className="text-gray-600 mb-3" numberOfLines={2}>
                    {company.description}
                </Text>
            )}
            {/* 매칭된 키워드 표시 */}
            {hasMatches ? (
                <View className="border-t border-gray-100 pt-3">
                    <Text className="text-sm text-blue-600 font-semibold mb-2">
                        매칭된 키워드 ({matchedCount}개)
                    </Text>
                    <View className="space-y-1">
                        {matchedKeywords.countries.length > 0 && (
                            <View className="flex-row items-center">
                                <Ionicons name="globe-outline" size={16} color="#3b82f6" />
                                <Text className="text-sm text-gray-700 ml-2">
                                    {matchedKeywords.countries.join(', ')}
                                </Text>
                            </View>
                        )}
                        {matchedKeywords.jobs.length > 0 && (
                            <View className="flex-row items-start">
                                <Ionicons name="briefcase-outline" size={16} color="#3b82f6" />
                                <Text className="text-sm text-gray-700 ml-2 flex-1">
                                    {matchedKeywords.jobs.join(', ')}
                                </Text>
                            </View>
                        )}
                        {matchedKeywords.conditions.length > 0 && (
                            <View className="flex-row items-start">
                                <Ionicons name="time-outline" size={16} color="#3b82f6" />
                                <Text className="text-sm text-gray-700 ml-2 flex-1">
                                    {matchedKeywords.conditions.join(', ')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            ) : (
                <View className="border-t border-gray-100 pt-3">
                    <Text className="text-sm text-gray-500">
                        매칭된 키워드가 없습니다
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};
export default CompanyCard;