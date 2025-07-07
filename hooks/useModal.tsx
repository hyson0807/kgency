// hooks/useModal.tsx

import { useState } from 'react'
import CustomModal from '@/components/CustomModal'

export const useModal = () => {
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'confirm' | 'warning' | 'info',
        onConfirm: () => {},
        showCancel: false
    })

    const showModal = (
        title: string,
        message: string,
        type: 'info' | 'confirm' | 'warning' = 'info',
        onConfirm?: () => void,
        showCancel: boolean = false
    ) => {
        setModalConfig({
            visible: true,
            title,
            message,
            type,
            onConfirm: onConfirm || (() => setModalConfig(prev => ({ ...prev, visible: false }))),
            showCancel
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
            onConfirm={modalConfig.onConfirm}
            showCancel={modalConfig.showCancel}
            confirmText={modalConfig.type === 'confirm' && modalConfig.showCancel ? '전화' : '확인'}
            cancelText="취소"
        />
    )

    return {
        showModal,
        hideModal,
        ModalComponent
    }
}