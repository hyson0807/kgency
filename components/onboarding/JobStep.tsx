import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import JobPreferencesSelector from '@/components/shared/keyword/JobPreferencesSelector';

interface JobStepProps {
  jobs: any[];
  selectedJobs: number[];
  onToggle: (id: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const JobStep = ({
  jobs,
  selectedJobs,
  onToggle,
  onNext,
  onBack
}: JobStepProps) => {
  const { t } = useTranslation();

  const isValid = selectedJobs.length > 0;

  return (
    <View className="flex-1">
      <View className="flex-1">
        <View className="px-4 mb-2">
          <Text className="text-red-500 text-xs">
            * {t('common.required_select_min_one', '필수 선택 (최소 1개)')}
          </Text>
        </View>

        <JobPreferencesSelector
          jobs={jobs}
          selectedJobs={selectedJobs}
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

export default JobStep;