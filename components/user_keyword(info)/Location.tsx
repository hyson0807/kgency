import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/contexts/TranslationContext";

// 타입 정의
interface Keyword {
    id: number;
    keyword: string;
    category: string;
}

interface LocationSelectorProps {
    keywords: Keyword[];
    selectedLocations: number[];
    selectedMoveable: number | null;
    onLocationChange: (locations: number[]) => void;
    onMoveableToggle: (moveableId: number | null) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
                                                                      keywords,
                                                                      selectedLocations,
                                                                      selectedMoveable,
                                                                      onLocationChange,
                                                                      onMoveableToggle
                                                                  }) => {
    // Hook으로 번역 함수 가져오기
    const { t, translateDB } = useTranslation();

    // 필터링된 키워드들
    const locationKeywords = keywords.filter(k => k.category === '지역');
    const moveableKeyword = keywords.find(k => k.category === '지역이동');

    // 드롭다운 옵션 생성
    const locationOptions = locationKeywords.map(location => ({
        label: translateDB('keyword', 'keyword', location.id.toString(), location.keyword),
        value: location.id,
    }));

    // 지역 추가
    const handleLocationAdd = (locationId: number) => {
        if (!selectedLocations.includes(locationId)) {
            onLocationChange([...selectedLocations, locationId]);
        }
    };

    // 지역 제거
    const handleLocationRemove = (locationId: number) => {
        onLocationChange(selectedLocations.filter(id => id !== locationId));
    };

    // 지역이동 가능 토글
    const handleMoveableToggle = () => {
        if (moveableKeyword) {
            onMoveableToggle(
                selectedMoveable === moveableKeyword.id ? null : moveableKeyword.id
            );
        }
    };

    return (
        <View className="p-4">
            <Text className="text-base font-semibold mb-3">
                {t('info.desired_location', '희망 근무 지역')}
            </Text>

            <View className="p-3 bg-gray-50 rounded-xl">
                {/* 지역 선택 드롭다운 */}
                <Dropdown
                    style={{
                        height: 45,
                        borderColor: '#d1d5db',
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        backgroundColor: 'white',
                    }}
                    placeholderStyle={{
                        fontSize: 14,
                        color: '#9ca3af'
                    }}
                    selectedTextStyle={{
                        fontSize: 14,
                    }}
                    inputSearchStyle={{
                        height: 40,
                        fontSize: 14,
                    }}
                    iconStyle={{
                        width: 20,
                        height: 20,
                    }}
                    data={locationOptions}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={
                        selectedLocations.length > 0
                            ? t('info.locations_selected', `${selectedLocations.length}개 선택됨`, { count: selectedLocations.length })
                            : t('info.select_location', '지역을 선택하세요')
                    }
                    searchPlaceholder={t('info.search', '검색...')}
                    value={null}
                    onChange={item => handleLocationAdd(item.value)}
                />

                {/* 선택된 지역 태그들 */}
                {selectedLocations.length > 0 && (
                    <SelectedLocationTags
                        selectedLocations={selectedLocations}
                        keywords={keywords}
                        onRemove={handleLocationRemove}
                    />
                )}

                {/* 지역이동 가능 토글 */}
                {moveableKeyword && (
                    <MoveableToggle
                        moveableKeyword={moveableKeyword}
                        isSelected={selectedMoveable === moveableKeyword.id}
                        onToggle={handleMoveableToggle}
                    />
                )}
            </View>
        </View>
    );
};

// 선택된 지역 태그 컴포넌트
interface SelectedLocationTagsProps {
    selectedLocations: number[];
    keywords: Keyword[];
    onRemove: (locationId: number) => void;
}

const SelectedLocationTags: React.FC<SelectedLocationTagsProps> = ({
                                                                       selectedLocations,
                                                                       keywords,
                                                                       onRemove,
                                                                   }) => {
    const { translateDB } = useTranslation();

    return (
        <View className="flex-row flex-wrap gap-2 mt-3">
            {selectedLocations.map(locationId => {
                const location = keywords.find(k => k.id === locationId);
                if (!location) return null;

                return (
                    <View
                        key={locationId}
                        className="flex-row items-center bg-blue-500 px-3 py-2 rounded-full"
                    >
                        <Text className="text-white text-sm font-medium mr-2">
                            {translateDB('keyword', 'keyword', location.id.toString(), location.keyword)}
                        </Text>
                        <TouchableOpacity onPress={() => onRemove(locationId)}>
                            <Ionicons name="close-circle" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                );
            })}
        </View>
    );
};

// 지역이동 가능 토글 컴포넌트
interface MoveableToggleProps {
    moveableKeyword: Keyword;
    isSelected: boolean;
    onToggle: () => void;
}

const MoveableToggle: React.FC<MoveableToggleProps> = ({
                                                           moveableKeyword,
                                                           isSelected,
                                                           onToggle,
                                                       }) => {
    const { translateDB } = useTranslation();

    return (
        <TouchableOpacity
            onPress={onToggle}
            className="mt-3 flex-row items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
        >
            <Text className="text-sm text-gray-700">
                {translateDB('keyword', 'keyword', moveableKeyword.id.toString(), moveableKeyword.keyword)}
            </Text>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                isSelected
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
            }`}>
                {isSelected && (
                    <Ionicons name="checkmark" size={12} color="white" />
                )}
            </View>
        </TouchableOpacity>
    );
};