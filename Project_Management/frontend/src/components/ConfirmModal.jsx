import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1d2125] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-[#333c44]">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-xl ${type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-[#5794f7]'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#333c44] rounded-full text-gray-400 dark:text-[#9fadbc] transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-black text-[#172b4d] dark:text-[#b6c2cf] mb-2">{title}</h3>
                    <p className="text-[#44546f] dark:text-[#9fadbc] font-medium leading-relaxed">{message}</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#161a1d] px-6 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-black text-[#44546f] dark:text-[#9fadbc] hover:bg-gray-200 dark:hover:bg-[#333c44] rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`flex-1 px-4 py-2.5 text-sm font-black text-white rounded-xl transition-all shadow-lg active:scale-95 ${type === 'danger'
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                            : 'bg-[#0c66e4] hover:bg-[#0055cc] shadow-blue-200'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
