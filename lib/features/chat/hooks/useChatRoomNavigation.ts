import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/core/api'
import { useModal } from '@/lib/shared/ui/hooks/useModal'

interface UseChatRoomNavigationParams {
  onError?: (error: string) => void
}

export const useChatRoomNavigation = ({ onError }: UseChatRoomNavigationParams = {}) => {
  const router = useRouter()
  const { user } = useAuth()
  const { showModal } = useModal()

  const createAndNavigateToChat = async ({
    companyId,
    userId,
    jobPostingId,
    applicationId,
    initialMessage,
    messageType = 'text',
    fromApplication = false,
    videoUrl
  }: {
    companyId: string
    userId: string
    jobPostingId: string
    applicationId?: string
    initialMessage?: string
    messageType?: 'text' | 'resume'
    fromApplication?: boolean
    videoUrl?: string
  }) => {
    if (!user?.userId) {
      onError?.('User not authenticated')
      return false
    }

    try {
      // 현재 사용자의 타입에 따라 채팅 상대방 결정
      const isCompany = user.userType === 'company'
      const currentUserId = user.userId
      
      // 실제 회사 ID와 구직자 ID 결정
      const actualCompanyId = isCompany ? currentUserId : (companyId || '')
      const actualUserId = isCompany ? userId : currentUserId
      
      console.log('채팅방 생성 파라미터:', {
        isCompany,
        currentUserId,
        actualCompanyId,
        actualUserId,
        jobPostingId,
        applicationId
      })
      
      // 먼저 기존 채팅방이 있는지 확인
      const existingRoomResponse = await api('GET', `/api/chat/find-existing-room?user_id=${actualUserId}&company_id=${actualCompanyId}`)
      
      let roomId = null
      
      if (existingRoomResponse.success && existingRoomResponse.data?.roomId) {
        // 기존 채팅방이 있으면 재사용
        roomId = existingRoomResponse.data.roomId
        console.log('기존 채팅방 재사용:', roomId)
      } else {
        // 기존 채팅방이 없으면 새로 생성
        let chatRoomResponse

        if (jobPostingId && applicationId) {
          // 지원서 기반 채팅방 생성
          chatRoomResponse = await api('POST', '/api/chat/create-room', {
            application_id: applicationId,
            user_id: actualUserId,
            company_id: actualCompanyId,
            job_posting_id: jobPostingId
          })
        } else {
          // 일반 채팅방 생성 (job_posting_id 없이)
          chatRoomResponse = await api('POST', '/api/chat/create-general-room', {
            user_id: actualUserId,
            company_id: actualCompanyId
          })
        }

        if (chatRoomResponse.success && chatRoomResponse.data?.id) {
          roomId = chatRoomResponse.data.id
          console.log('새 채팅방 생성:', roomId)
        }
      }

      if (roomId) {
        console.log('✅ 채팅방 이동 준비:', roomId)
        
        // 채팅방으로 이동
        const navigationParams: any = {
          pathname: '/chat/[roomId]',
          params: {
            roomId: roomId,
            fromApplication: fromApplication.toString()
          }
        }

        // 초기 메시지가 있는 경우 파라미터에 추가
        if (initialMessage) {
          navigationParams.params.initialMessage = initialMessage
          navigationParams.params.messageType = messageType
        }

        // 영상 URL이 있는 경우 파라미터에 추가
        if (videoUrl) {
          navigationParams.params.videoUrl = videoUrl
        }

        router.replace(navigationParams)
        console.log('🚀 채팅방 이동 실행됨')
        return true
      } else {
        throw new Error('채팅방 생성/접근에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('채팅방 생성/이동 에러:', error)
      console.error('에러 상세:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
          data: error?.config?.data
        }
      })
      
      let errorMessage = '채팅방 접근에 실패했습니다.'
      if (error?.response?.status === 403) {
        errorMessage = '채팅방 생성 권한이 없습니다.'
      } else if (error?.response?.status === 404) {
        errorMessage = '사용자 또는 공고를 찾을 수 없습니다.'
      } else if (error?.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다.'
      }
      
      onError?.(errorMessage)
      showModal('오류', errorMessage, 'warning')
      return false
    }
  }

  return {
    createAndNavigateToChat
  }
}