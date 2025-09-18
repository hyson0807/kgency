import { useState, useEffect } from 'react'
import { api } from '@/lib/core/api'

interface UserProfileImage {
  id: string
  name: string
  user_type: 'user' | 'company'
  profile_image_url?: string | null
}

export const useUserProfileImage = (userId: string | string[] | null) => {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    const userIdParam = Array.isArray(userId) ? userId[0] : userId
    if (!userIdParam) return

    setLoading(true)
    setError(null)

    try {
      const response = await api<{ success: boolean; data: UserProfileImage }>('GET', `/api/profiles/user/${userIdParam}`)
      if (response.success && response.data) {
        setProfileImage(response.data.profile_image_url || null)
        setUserName(response.data.name)
      } else {
        setError('프로필을 불러올 수 없습니다')
      }
    } catch (err) {
      console.error('사용자 프로필 조회 실패:', err)
      setError('프로필을 불러오는 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return {
    profileImage,
    userName,
    loading,
    error,
    refetch: fetchUserProfile
  }
}