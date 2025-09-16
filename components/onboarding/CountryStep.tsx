import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Country } from '@/components/user/profile/keywords/Country';

interface CountryStepProps {
  keywords: any[];
  selectedCountry: number | null;
  setSelectedCountry: (id: number | null) => void;
  onNext: () => void;
  onBack: () => void;
}

const CountryStep = ({
  keywords,
  selectedCountry,
  setSelectedCountry,
  onNext,
  onBack
}: CountryStepProps) => {
  const { t } = useTranslation();

  const isValid = selectedCountry !== null;

  return (
    <View className="flex-1">
      <View className="flex-1">
        <View className="px-4 mb-2">
          <Text className="text-red-500 text-xs">
            * {t('common.required_select', '필수 선택')}
          </Text>
        </View>

        <Country
          keywords={keywords}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
        />
      </View>

      <View className="bg-white border-t border-gray-200 px-4 py-4 pb-8">
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 items-center justify-center py-4 rounded-2xl border border-gray-300"
            onPress={onBack}
          >
            <Text className="font-semibold text-base text-gray-700">
              {t('common.previous', '이전')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 items-center justify-center py-4 rounded-2xl shadow-sm ${
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
    </View>
  );
};

export default CountryStep;