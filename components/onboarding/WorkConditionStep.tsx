import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import WorkConditionsSelector from '@/components/shared/keyword/WorkConditionsSelector';

interface WorkConditionStepProps {
  conditions: any[];
  selectedConditions: number[];
  onToggle: (id: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

const WorkConditionStep = ({
  conditions,
  selectedConditions,
  onToggle,
  onComplete,
  onBack
}: WorkConditionStepProps) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1">
      <View className="flex-1">
        <View className="px-4 mb-2">
          <Text className="text-gray-500 text-xs">
            {t('common.optional_select', '선택 사항')}
          </Text>
        </View>

        <WorkConditionsSelector
          conditions={conditions}
          selectedConditions={selectedConditions}
          onToggle={onToggle}
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
            className="flex-1 items-center justify-center py-4 rounded-2xl shadow-sm bg-blue-500"
            onPress={onComplete}
          >
            <Text className="font-semibold text-base text-white">
              {t('info.save', '저장하기')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default WorkConditionStep;