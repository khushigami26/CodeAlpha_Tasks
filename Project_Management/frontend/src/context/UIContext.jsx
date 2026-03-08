import React, { createContext, useContext, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Delete',
        type: 'danger',
        onConfirm: () => { }
    });

    const showConfirm = (options) => {
        setConfirmState({
            ...options,
            isOpen: true
        });
    };

    const hideConfirm = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <UIContext.Provider value={{ showConfirm, hideConfirm }}>
            {children}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={hideConfirm}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                type={confirmState.type}
            />
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
