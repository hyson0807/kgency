import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { Ionicons } from '@expo/vector-icons'

interface Keyword {
    id: number
    keyword: string
    category: string
}

interface MultiSelectKeywordSelectorProps {
    title: string
    placeholder: string
    keywords: Keyword[]
    selectedIds: number[]
    onSelect: (item: any) => void
    onRemove: (id: number) => void
    onRemoveAll?: () => void
    emptyText: string
    showNoPreferenceOption?: boolean
    enableSearch?: boolean
}

export const MultiSelectKeywordSelector: React.FC<MultiSelectKeywordSelectorProps> = ({
    title,
    placeholder,
    keywords,
    selectedIds,
    onSelect,
    onRemove,
    onRemoveAll,
    emptyText,
    showNoPreferenceOption = true,
    enableSearch = false
}) => {
    const isAllSelected = selectedIds.length === keywords.length
    
    const dropdownOptions = [
        ...(showNoPreferenceOption ? [{ label: '상관없음', value: 'all' }] : []),
        ...keywords
            .filter(keyword => !selectedIds.includes(keyword.id)) // Filter out already selected items
            .map(keyword => ({
                label: keyword.keyword,
                value: keyword.id
            }))
    ]

    const selectedKeywords = keywords.filter(k => selectedIds.includes(k.id))
    
    // Dynamic placeholder based on selection state
    const availableItemsCount = keywords.length - selectedIds.length
    
    const dynamicPlaceholder = isAllSelected
        ? "모든 항목이 선택됨"
        : availableItemsCount === 0
        ? "선택 가능한 항목 없음"
        : `${placeholder} (${availableItemsCount}개 남음)`

    return (
        <View className="bg-white mx-4 mb-4 p-4 rounded-2xl shadow-sm">
            <Text className="text-base font-semibold mb-3">{title}</Text>
            
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
                onChange={onSelect}
            />

            <View className="flex-row flex-wrap mt-3">
                {selectedKeywords.length === 0 ? (
                    <Text className="text-gray-400 text-sm">{emptyText}</Text>
                ) : selectedIds.length === keywords.length ? (
                    <View className="flex-row items-center bg-blue-100 rounded-full px-3 py-1.5 m-1">
                        <Text className="text-blue-600 text-sm mr-1">상관없음</Text>
                        <TouchableOpacity onPress={() => {
                            if (onRemoveAll) {
                                onRemoveAll()
                            } else {
                                // Fallback: Remove all selected items one by one
                                selectedIds.forEach(id => onRemove(id))
                            }
                        }}>
                            <Ionicons name="close" size={14} color="#2563eb" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    selectedKeywords.map(keyword => (
                        <View key={keyword.id} className="flex-row items-center bg-blue-100 rounded-full px-3 py-1.5 m-1">
                            <Text className="text-blue-600 text-sm mr-1">{keyword.keyword}</Text>
                            <TouchableOpacity onPress={() => onRemove(keyword.id)}>
                                <Ionicons name="close" size={14} color="#2563eb" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        </View>
    )
}