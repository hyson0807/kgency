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
    
    // 상관없음 키워드 찾기
    const anyCountryKeyword = keywords.find(k => k.keyword === '상관없음')
    
    const dropdownOptions = [
        // 상관없음을 맨 위로
        ...(anyCountryKeyword && !selectedIds.includes(anyCountryKeyword.id) 
            ? [{ label: '상관없음', value: anyCountryKeyword.id }]
            : []),
        ...keywords
            .filter(keyword => !selectedIds.includes(keyword.id) && keyword.keyword !== '상관없음')
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