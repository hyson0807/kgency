import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { router } from "expo-router";
import { useMatchedJobPostings } from "@/hooks/useMatchedJobPostings";
import AntDesign from '@expo/vector-icons/AntDesign';
import { api } from "@/lib/api";

interface Application {
    id: string
    applied_at: string
    status: string
    type?: string  // type 필드 추가
    user: {
        id: string
        name: string
        phone_number: string
        address?: string
        user_info?: {
            age?: number;
            gender?: string;
            visa?: string;
            how_long?: string;
            topic?: string;
            korean_level?: string;
            experience?: string;
            experience_content?: string;
        }
        user_keyword?: {
            keyword_id: number;
            keywords: {
                id: number;
                keyword: string;
                category: string;
            }
        }[]
    }
    message?: {
        content: string
        is_read: boolean
    }
}

interface ApplicantCardProps {
    item: Application;
    postingId: string;
    proposalStatus?: string;
    onStatusChange?: () => void; // 상태 변경 콜백
}

export const ApplicantCard = ({ item, postingId, proposalStatus = 'none', onStatusChange }: ApplicantCardProps) => {
    const { showModal, ModalComponent } = useModal();
    const { fetchPostingById, getPostingKeywords } = useMatchedJobPostings();
    const [matchedKeywords, setMatchedKeywords] = useState<{ id: number; keyword: string; category: string }[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadPostingAndMatchKeywords = async () => {
            const posting = await fetchPostingById(postingId);
            if (posting) {
                const postingKeywords = getPostingKeywords(posting);

                // 모든 공고 키워드를 평면 배열로 변환
                const allPostingKeywords = [
                    ...postingKeywords.countries,
                    ...postingKeywords.jobs,
                    ...postingKeywords.conditions,
                    ...postingKeywords.location,
                    ...postingKeywords.moveable,
                    ...postingKeywords.gender,
                    ...postingKeywords.age,
                    ...postingKeywords.visa
                ];

                // 유저 키워드와 공고 키워드 매칭
                const matched = item.user.user_keyword?.filter(userKw =>
                    allPostingKeywords.some(postingKw => postingKw.id === userKw.keywords.id)
                ).map(uk => uk.keywords) || [];

                setMatchedKeywords(matched);
            }
        };

        loadPostingAndMatchKeywords();
    }, [postingId, item.user.user_keyword]);

    const handleViewResume = (application: Application) => {
        if (application.message) {
            router.push({
                pathname: '/(pages)/(company)/view-resume',
                params: {
                    applicationId: application.id,
                    userName: application.user.name,
                    resume: application.message.content,
                    userPhone: application.user.phone_number
                }
            })
        }
    }

    const handleCancelProposal = async () => {
        if (isDeleting) return; // 이미 진행 중이면 중복 실행 방지
        
        const confirmMessage = item.type === 'company_invited'
            ? '회사가 제안한 지원서이므로 면접 제안과 함께 지원서도 삭제됩니다. 계속하시겠습니까?'
            : '면접 제안을 취소하시겠습니까?';

        showModal(
            '면접 제안 취소',
            confirmMessage,
            'warning',
            async () => {
                try {
                    setIsDeleting(true);
                    const response = await api('DELETE', `/api/interview-proposals/company/${item.id}`);

                    if (response?.success) {
                        // 성공 시 상태 변경 콜백 실행 (모달 없이)
                        if (onStatusChange) {
                            onStatusChange();
                        }
                    } else {
                        // 에러 메시지를 console에만 출력하고 모달은 표시하지 않음
                        console.error('면접 제안 취소 실패:', response?.message || '면접 제안 취소에 실패했습니다.');
                    }
                } catch (error) {
                    // 에러 메시지를 console에만 출력하고 모달은 표시하지 않음
                    console.error('면접 제안 취소 실패:', error);
                } finally {
                    setIsDeleting(false);
                }
            },
            true, // showCancel
            '확인',
            '취소'
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    const locationKeyword = item.user.user_keyword?.find(
        uk => uk.keywords.category === '지역'
    )?.keywords.keyword;

    // 카테고리별 색상 설정
    const getCategoryColor = (category: string) => {
        switch (category) {
            case '국가': return 'bg-purple-100 text-purple-700';
            case '직종': return 'bg-orange-100 text-orange-700';
            case '근무조건': return 'bg-blue-100 text-blue-700';
            case '지역': return 'bg-green-100 text-green-700';
            case '지역이동': return 'bg-teal-100 text-teal-700';
            case '성별': return 'bg-pink-100 text-pink-700';
            case '나이대': return 'bg-yellow-100 text-yellow-700';
            case '비자': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const renderInterviewButton = () => {
        switch (proposalStatus) {
            case 'pending':
                return (
                    <View className="flex-1 gap-2">
                        <View className="bg-orange-100 py-3 rounded-lg flex-row items-center justify-center">
                            <AntDesign name="clockcircleo" size={18} color="#ea580c" />
                            <Text className="text-orange-600 font-medium ml-2">면접 제안됨</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleCancelProposal}
                            disabled={isDeleting}
                            className="bg-red-500 py-2 rounded-lg flex-row items-center justify-center"
                        >
                            <AntDesign name="close" size={16} color="white" />
                            <Text className="text-white text-sm font-medium ml-1">
                                {isDeleting ? '취소 중...' : '면접 제안 취소'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'scheduled':
                return (
                    <View className="flex-1 bg-green-100 py-3 rounded-lg flex-row items-center justify-center">
                        <AntDesign name="checkcircleo" size={18} color="#16a34a" />
                        <Text className="text-green-600 font-medium ml-2">면접 확정됨</Text>
                    </View>
                );

            default: // 'none'
                return (
                    <TouchableOpacity
                        onPress={() => {
                            router.push({
                                pathname: '/(pages)/(company)/interview-schedule',
                                params: {
                                    applicationId: item.id,
                                    userId: item.user.id,
                                    postingId: postingId,
                                    onComplete: 'refresh'
                                }
                            })
                        }}
                        className="flex-1 bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"
                    >
                        <AntDesign name="calendar" size={18} color="white" />
                        <Text className="text-white font-medium ml-2">면접 제안하기</Text>
                    </TouchableOpacity>
                );
        }
    };

    return (
        <>
            <View className="bg-white mx-4 my-2 p-4 rounded-xl shadow-sm gap-3">
                <View className="flex-row items-center gap-5">
                    <View className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full">
                        <Text className="text-2xl font-bold">{item.user.name.charAt(0)}</Text>
                    </View>
                    <View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-lg font-bold">{item.user.name}</Text>
                            {item.message && !item.message.is_read && (
                                <View className="bg-blue-500 px-2 py-0.5 rounded-full">
                                    <Text className="text-xs text-white">새 이력서</Text>
                                </View>
                            )}
                            <Text className="text-sm text-gray-600">{formatDate(item.applied_at)}</Text>
                        </View>
                        <View className="flex-row items-center gap-5">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-sm text-gray-600">{item.user.user_info?.age}세 {item.user.user_info?.gender}</Text>
                                <Text className="text-sm text-gray-600">{item.user.user_info?.visa}</Text>
                                {locationKeyword && (
                                    <>
                                        <Text className="text-sm text-gray-600">📍{locationKeyword}</Text>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {item.type == 'user_initiated' && (
                    <View className="flex bg-gray-100 rounded-xl p-2">
                        <Text className="text-start flex-shrink" numberOfLines={2}>{item.message?.content}</Text>
                    </View>
                )}

                {/* 매칭된 키워드 표시 */}
                {matchedKeywords.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 ">
                        <Text className="text-sm text-gray-600 w-full mb-1">해당 지원자는 사장님이 선택하신 아래 조건들을 선택했습니다</Text>
                        {matchedKeywords.map((keyword) => (
                            <View
                                key={keyword.id}
                                className={`px-3 py-1 rounded-full ${getCategoryColor(keyword.category)}`}
                            >
                                <Text className="text-xs font-medium">
                                    ✓ {keyword.keyword}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* 버튼들 */}
                <View className="flex-row gap-2 pt-3 border-t border-gray-100">
                    {item.type === 'company_invited' ? (
                        <View className="flex-1 bg-blue-100 py-3 px-1 rounded-lg flex-row items-center justify-center">
                            <Text className="font-medium ml-2 text-blue-600 text-center flex-shrink">사장님이 면접 제안한 구직자입니다</Text>
                        </View>
                    ) : item.type === 'user_instant_interview' ? (
                        <View className="flex-1 bg-purple-100 py-3 px-1 rounded-lg flex-row items-center justify-center">
                            <Text className="font-medium ml-2 text-purple-600 text-center flex-shrink">즉시 면접 유저입니다</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => handleViewResume(item)}
                            className="flex-1 bg-gray-100 py-3 rounded-lg flex-row items-center justify-center"
                        >
                            <Ionicons name="document-text-outline" size={18} color="black" />
                            <Text className="font-medium ml-2">이력서 보기</Text>
                        </TouchableOpacity>
                    )}

                    {renderInterviewButton()}
                </View>
            </View>
            <ModalComponent />
        </>
    )
}