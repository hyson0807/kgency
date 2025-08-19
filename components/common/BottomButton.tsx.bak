import React, { JSX } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';

interface PrimaryButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
                                                                title,
                                                                loading = false,
                                                                disabled = false,
                                                                variant = 'primary',
                                                                size = 'large',
                                                                fullWidth = true,
                                                                icon,
                                                                iconPosition = 'left',
                                                                className = '',
                                                                ...props
                                                            }) => {
    // 버튼 색상 스타일
    const variantStyles = {
        primary: {
            enabled: 'bg-blue-500',
            disabled: 'bg-gray-400'
        },
        secondary: {
            enabled: 'bg-gray-200',
            disabled: 'bg-gray-100'
        },
        danger: {
            enabled: 'bg-red-500',
            disabled: 'bg-red-300'
        },
        success: {
            enabled: 'bg-green-500',
            disabled: 'bg-green-300'
        }
    };

    // 버튼 크기 스타일
    const sizeStyles = {
        small: 'py-2 px-4',
        medium: 'py-3 px-6',
        large: 'py-4 px-8'
    };

    // 텍스트 크기 스타일
    const textSizeStyles = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg'
    };

    // 텍스트 색상
    const textColorStyles = {
        primary: 'text-white',
        secondary: 'text-gray-700',
        danger: 'text-white',
        success: 'text-white'
    };

    const isDisabled = disabled || loading;
    const buttonStyle = isDisabled
        ? variantStyles[variant].disabled
        : variantStyles[variant].enabled;

    return (
        <TouchableOpacity
            disabled={isDisabled}
            className={`
                ${buttonStyle} 
                ${sizeStyles[size]} 
                rounded-xl 
                ${fullWidth ? 'w-full' : ''} 
                ${className}
            `}
            {...props}
        >
            <View className="flex-row items-center justify-center">
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={variant === 'secondary' ? '#374151' : 'white'}
                    />
                ) : (
                    <>
                        {icon && iconPosition === 'left' && (
                            <View className="mr-2">{icon}</View>
                        )}
                        <Text className={`
                            ${textColorStyles[variant]} 
                            font-bold 
                            ${textSizeStyles[size]}
                            text-center
                        `}>
                            {title}
                        </Text>
                        {icon && iconPosition === 'right' && (
                            <View className="ml-2">{icon}</View>
                        )}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

// 특화된 버튼 컴포넌트들
export const SubmitButton: React.FC<Omit<PrimaryButtonProps, 'variant'>> = (props) => (
    <PrimaryButton variant="primary" {...props} />
);

export const CancelButton: React.FC<Omit<PrimaryButtonProps, 'variant'>> = (props) => (
    <PrimaryButton variant="secondary" {...props} />
);

export const DangerButton: React.FC<Omit<PrimaryButtonProps, 'variant'>> = (props) => (
    <PrimaryButton variant="danger" {...props} />
);

// 하단 고정 버튼 컴포넌트
interface BottomButtonProps extends PrimaryButtonProps {
    containerClassName?: string;
}

export const BottomButton: React.FC<BottomButtonProps> = ({
                                                              containerClassName = '',
                                                              ...props
                                                          }) => {
    return (
        <View className={`p-4 border-t border-gray-200 ${containerClassName}`}>
            <PrimaryButton fullWidth {...props} />
        </View>
    );
};

// 사용 예시 타입
export interface ButtonUsageExamples {
    // 기본 사용
    basic: JSX.Element;
    // 로딩 상태
    loading: JSX.Element;
    // 아이콘 포함
    withIcon: JSX.Element;
    // 하단 고정 버튼
    bottom: JSX.Element;
}