import { useEffect } from 'react'
import { router } from 'expo-router'
const Keywords = () => {
    useEffect(() => {
        // 기존 keywords 페이지에 접근하면 새로운 3단계 페이지로 리디렉트
        router.replace('/keywords-step1')
    }, [])
    return null
}
export default Keywords