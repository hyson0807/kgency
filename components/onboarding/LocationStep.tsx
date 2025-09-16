import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { LocationSelector } from '@/components/user/profile/keywords/Location';

interface LocationStepProps {
  keywords: any[];
  selectedLocations: number[];
  selectedMoveable: number | null;
  onLocationChange: (ids: number[]) => void;
  onMoveableToggle: (id: number | null) => void;
  onNext: () => void;
}

const LocationStep = ({
  keywords,
  selectedLocations,
  selectedMoveable,
  onLocationChange,
  onMoveableToggle,
  onNext
}: LocationStepProps) => {
  const { t } = useTranslation();

  const isValid = selectedMoveable || selectedLocations.length > 0;

  return (
    <View className="flex-1">
      <View className="flex-1">
        <View className="px-4 mb-2">
          <Text className="text-red-500 text-xs">
            * {t('common.required_select_location', '필수 선택 (지역 또는 지역이동 가능 선택)')}
          </Text>
        </View>

        <LocationSelector
          keywords={keywords}
          selectedLocations={selectedLocations}
          selectedMoveable={selectedMoveable}
          onLocationChange={onLocationChange}
          onMoveableToggle={onMoveableToggle}
        />
      </View>

      <View className="bg-white border-t border-gray-200 px-4 py-4 pb-8">
        <TouchableOpacity
          className={`w-full items-center justify-center py-4 rounded-2xl shadow-sm ${
            isValid ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          onPress={onNext}
          disabled={!isValid}
        >
          <Text className="font-semibold text-base text-white">
            {isValid
              ? t('common.next', '다음')
              : t('common.select_required_items', '필수 항목을 선택해주세요')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationStep;