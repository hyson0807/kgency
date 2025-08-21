import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from "@/lib/api"
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
interface TokenTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'spend';
  amount: number;
  description?: string;
  created_at: string;
  balance_after?: number;
  reference_id?: string;
}
const UsageHistory = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    fetchTokenHistory();
  }, []);
  const fetchTokenHistory = async () => {
    if (!user) {
      return;
    }
    try {
      const response = await api('GET', '/api/purchase/tokens/transactions');
      if (response?.success) {
        setTransactions(response.transactions || []);
      } else {
        setTransactions([]);
      }
    } catch (error: any) {
      
      if (error?.message?.includes('Network Error')) {
      }
      
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    fetchTokenHistory();
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const getTransactionIcon = (type: string) => {
    return type === 'purchase' ? 'add-circle' : 'remove-circle';
  };
  const getTransactionColor = (type: string) => {
    return type === 'purchase' ? '#10B981' : '#EF4444';
  };
  const getAmountText = (type: string, amount: number) => {
    return type === 'purchase' ? `+${amount}` : `-${Math.abs(amount)}`;
  };

  const getTransactionDescription = (transaction: TokenTransaction) => {
    if (transaction.description) {
      return transaction.description;
    }
    
    // 기본 설명 제공
    switch (transaction.type) {
      case 'purchase':
        return t('usageHistory.tokenPurchase', '토큰 구매');
      case 'spend':
      case 'usage':
        return t('usageHistory.tokenUsage', '토큰 사용');
      default:
        return t('usageHistory.transaction', '거래');
    }
  };
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">{t('usageHistory.loading', '토큰 이용 내역을 불러오고 있습니다...')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">{t('usageHistory.title', '토큰 이용 내역')}</Text>
            <View className="w-10" />
          </View>
        </View>
        {/* Content */}
        <View className="px-4 pt-6">
          {transactions.length === 0 ? (
            <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <View className="items-center">
                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg font-medium mt-4 mb-2">
                  {t('usageHistory.noHistory', '이용 내역이 없습니다')}
                </Text>
                <Text className="text-gray-400 text-center">
                  {t('usageHistory.noHistoryDesc', '토큰을 구매하거나 사용하면 이곳에서 확인할 수 있습니다')}
                </Text>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              {transactions.map((transaction) => (
                <View
                  key={transaction.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <View className="mr-3">
                        <Ionicons
                          name={getTransactionIcon(transaction.type)}
                          size={24}
                          color={getTransactionColor(transaction.type)}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold text-base">
                          {getTransactionDescription(transaction)}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {formatDate(transaction.created_at)}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text
                        className="font-bold text-lg"
                        style={{ color: getTransactionColor(transaction.type) }}
                      >
                        {getAmountText(transaction.type, transaction.amount)}
                      </Text>
                      {transaction.balance_after !== undefined && (
                        <Text className="text-gray-500 text-sm">
                          {t('usageHistory.balance', '잔액: ')}{transaction.balance_after}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};
export default UsageHistory;