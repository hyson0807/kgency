import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { Ionicons } from '@expo/vector-icons'
import { useKeywordSelection } from '@/hooks/useKeywordSelection'

interface Keyword {
    id: number
    keyword: string
    category: string
}

interface BaseKeywordSelectorProps {
    title: string
    placeholder: string
    keywords: Keyword[]
    selectedIds: number[]
    onSelectionChange: (newIds: number[]) => void
    emptyText: string
    showNoPreferenceOption?: boolean
    enableSearch?: boolean
    required?: boolean
}

export const BaseKeywordSelector: React.FC<BaseKeywordSelectorProps> = ({
    title,
    placeholder,
    keywords,
    selectedIds,
    onSelectionChange,
    emptyText,
    showNoPreferenceOption = true,
    enableSearch = false,
    required = false
}) => {
    const {
        handleSelect,
        handleRemove,
        handleRemoveAll,
        selectedKeywords
    } = useKeywordSelection({
        keywords,
        selectedIds,
        onSelectionChange
    })

    const isAllSelected = selectedIds.length === keywords.length
    
    const dropdownOptions = [
        ...(showNoPreferenceOption ? [{ label: '상관없음', value: 'all' }] : []),
        ...keywords
            .filter(keyword => !selectedIds.includes(keyword.id))
            .map(keyword => ({
                label: keyword.keyword,
                value: keyword.id
            }))
    ]
    
    // Dynamic placeholder based on selection state
    const availableItemsCount = keywords.length - selectedIds.length
    
    const dynamicPlaceholder = isAllSelected
        ? "모든 항목이 선택됨"
        : availableItemsCount === 0
        ? "선택 가능한 항목 없음"
        : `${placeholder} (${availableItemsCount}개 남음)`

    return (
        <View className="bg-white mx-4 mb-4 p-4 rounded-2xl shadow-sm">
            <Text className="text-base font-semibold mb-3">
                {title}{required && ' *'}
            </Text>
            
            <Dropdown
                style={{
                    height: 48,
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                }}
                placeholderStyle={{ fontSize: 14, color: '#9ca3af' }}
                selectedTextStyle={{ fontSize: 14 }}
                inputSearchStyle={{ height: 40, fontSize: 14 }}
                data={dropdownOptions}
                search={enableSearch}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={dynamicPlaceholder}
                searchPlaceholder="검색..."
                value={null}
                onChange={handleSelect}
            />

            <View className="flex-row flex-wrap mt-3">
                {selectedKeywords.length === 0 ? (
                    <Text className="text-gray-400 text-sm">{emptyText}</Text>
                ) : selectedIds.length === keywords.length ? (
                    <View className="flex-row items-center bg-blue-100 rounded-full px-3 py-1.5 m-1">
                        <Text className="text-blue-600 text-sm mr-1">상관없음</Text>
                        <TouchableOpacity onPress={handleRemoveAll}>
                            <Ionicons name="close" size={14} color="#2563eb" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    selectedKeywords.map(keyword => (
                        <View key={keyword.id} className="flex-row items-center bg-blue-100 rounded-full px-3 py-1.5 m-1">
                            <Text className="text-blue-600 text-sm mr-1">{keyword.keyword}</Text>
                            <TouchableOpacity onPress={() => handleRemove(keyword.id)}>
                                <Ionicons name="close" size={14} color="#2563eb" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        </View>
    )
}