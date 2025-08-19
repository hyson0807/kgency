import { useCallback } from 'react'

interface Keyword {
    id: number
    keyword: string
    category: string
}

interface UseKeywordSelectionProps {
    keywords: Keyword[]
    selectedIds: number[]
    onSelectionChange: (newIds: number[]) => void
}

export const useKeywordSelection = ({
    keywords,
    selectedIds,
    onSelectionChange
}: UseKeywordSelectionProps) => {
    // 전체 선택 핸들러
    const handleSelectAll = useCallback(() => {
        const allIds = keywords.map(k => k.id)
        onSelectionChange(allIds)
    }, [keywords, onSelectionChange])

    // 개별 선택 핸들러
    const handleSelect = useCallback((item: any) => {
        if (item.value === 'all') {
            handleSelectAll()
        } else {
            if (!selectedIds.includes(item.value)) {
                onSelectionChange([...selectedIds, item.value])
            }
        }
    }, [selectedIds, onSelectionChange, handleSelectAll])

    // 개별 제거 핸들러
    const handleRemove = useCallback((id: number) => {
        onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
    }, [selectedIds, onSelectionChange])

    // 전체 제거 핸들러
    const handleRemoveAll = useCallback(() => {
        onSelectionChange([])
    }, [onSelectionChange])

    // 토글 핸들러 (기존 toggleJob, toggleCondition 로직)
    const handleToggle = useCallback((id: number) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(selectedId => selectedId !== id)
            : [...selectedIds, id]
        onSelectionChange(newIds)
    }, [selectedIds, onSelectionChange])

    return {
        handleSelect,
        handleRemove,
        handleRemoveAll,
        handleToggle,
        selectedKeywords: keywords.filter(k => selectedIds.includes(k.id))
    }
}