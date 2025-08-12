// hooks/useModal.tsx

import { useState } from 'react'
import CustomModal from '@/components/CustomModal'
import { useTranslation } from '@/contexts/TranslationContext'

export const useModal = () => {
    const { t } = useTranslation()

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'confirm' | 'warning' | 'info',
        onConfirm: () => {},
        showCancel: false,
        confirmText: '',
        cancelText: ''
    })

    const showModal = (
        title: string,
        message: string,
        type: 'info' | 'confirm' | 'warning' = 'info',
        onConfirm?: () => void,
        showCancel: boolean = false,
        confirmText?: string,
        cancelText?: string
    ) => {
        const defaultConfirmText = t('button.confirm', '확인')
        const defaultCancelText = t('button.cancel', '취소')

        setModalConfig({
            visible: true,
            title,
            message,
            type,
            onConfirm: onConfirm || (() => setModalConfig(prev => ({ ...prev, visible: false }))),
            showCancel,
            confirmText: confirmText || defaultConfirmText,
            cancelText: cancelText || defaultCancelText
        })
    }

    const hideModal = () => {
        setModalConfig(prev => ({ ...prev, visible: false }))
    }

    const ModalComponent = () => (
        <CustomModal
            visible={modalConfig.visible}
            onClose={hideModal}
            title={modalConfig.title}
            message={modalConfig.message}
            type={modalConfig.type}
            onConfirm={() => {
                hideModal()
                setTimeout(() => {
                    modalConfig.onConfirm()
                }, 0)
            }}
            showCancel={modalConfig.showCancel}
            confirmText={modalConfig.confirmText}
            cancelText={modalConfig.cancelText}
        />
    )

    return {
        showModal,
        hideModal,
        ModalComponent
    }
}
