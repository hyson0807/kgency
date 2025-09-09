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
                const selectedKeyword = keywords.find(k => k.id === item.value)
                const anyKeyword = keywords.find(k => k.keyword === '상관없음')
                
                let newIds = [...selectedIds, item.value]
                
                // "상관없음"을 선택한 경우: 다른 모든 선택을 제거
                if (selectedKeyword?.keyword === '상관없음') {
                    newIds = [item.value]
                } 
                // 다른 옵션을 선택한 경우: "상관없음"이 선택되어 있다면 제거
                else if (anyKeyword && selectedIds.includes(anyKeyword.id)) {
                    newIds = selectedIds.filter(id => id !== anyKeyword.id).concat(item.value)
                }
                
                onSelectionChange(newIds)
            }
        }
    }, [selectedIds, onSelectionChange, handleSelectAll, keywords])
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