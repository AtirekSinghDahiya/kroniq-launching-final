import React, { useEffect, useRef } from 'react';
import { X, Star, Check } from 'lucide-react';
import { AI_MODELS } from '../../lib/aiModels';

interface ModelBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedModel: string;
    onSelectModel: (modelId: string) => void;
    category?: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

export const ModelBottomSheet: React.FC<ModelBottomSheetProps> = ({
    isOpen,
    onClose,
    selectedModel,
    onSelectModel,
    category = 'chat'
}) => {
    const sheetRef = useRef<HTMLDivElement>(null);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Get FREE models only for quick selection
    const freeModels = AI_MODELS.filter(m => m.category === category && m.tier === 'FREE');

    // Recommended model ID
    const recommendedModelId = 'google/gemini-2.0-flash-001';

    const handleSelect = (modelId: string) => {
        onSelectModel(modelId);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
            onClick={handleBackdropClick}
            style={{ animation: 'fadeIn 0.25s ease-out' }}
        >
            {/* Bottom Sheet */}
            <div
                ref={sheetRef}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-[#1f1f1f] to-[#141414] rounded-t-[28px] p-5 pb-8 max-h-[75vh] overflow-y-auto shadow-2xl"
                style={{
                    paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
                    animation: 'slideUpSpring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                {/* Handle bar */}
                <div className="flex justify-center mb-5">
                    <div className="w-14 h-1.5 bg-white/25 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-semibold text-white">Select Model</h3>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all duration-200"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                {/* Recommended Model */}
                <button
                    onClick={() => handleSelect(recommendedModelId)}
                    className={`w-full p-4 rounded-2xl mb-4 flex items-center gap-4 transition-all duration-300 active:scale-[0.98] ${selectedModel === recommendedModelId
                        ? 'bg-gradient-to-r from-yellow-500/25 to-orange-500/25 border-2 border-yellow-500/60 shadow-lg shadow-yellow-500/10'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                >
                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                        <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-white text-base">Gemini 2.0 Flash</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                                ⭐ Recommended
                            </span>
                        </div>
                        <p className="text-sm text-white/50">Fast + Best Quality • Free</p>
                    </div>
                    {selectedModel === recommendedModelId && (
                        <div className="p-1.5 bg-yellow-500/20 rounded-full">
                            <Check className="w-4 h-4 text-yellow-400" />
                        </div>
                    )}
                </button>

                {/* Other Free Models */}
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3 px-1 font-medium">Other Free Models</p>
                <div className="space-y-2">
                    {freeModels.filter(m => m.id !== recommendedModelId).slice(0, 5).map((model, index) => {
                        const isSelected = selectedModel === model.id;
                        return (
                            <button
                                key={model.id}
                                onClick={() => handleSelect(model.id)}
                                className={`w-full p-3.5 rounded-xl flex items-center gap-3 transition-all duration-200 active:scale-[0.98] ${isSelected
                                    ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {model.logoUrl ? (
                                    <img src={model.logoUrl} alt={model.provider} className="w-9 h-9 rounded-lg" />
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                                        🤖
                                    </div>
                                )}
                                <div className="flex-1 text-left">
                                    <span className="font-medium text-white">{model.name}</span>
                                    <p className="text-xs text-white/50 line-clamp-1">{model.provider} • {model.description}</p>
                                </div>
                                {isSelected && (
                                    <div className="p-1.5 bg-cyan-500/20 rounded-full">
                                        <Check className="w-4 h-4 text-cyan-400" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* More Models Link */}
                <button
                    className="w-full mt-5 py-3.5 text-sm text-white/50 hover:text-white/80 transition-all duration-200 hover:bg-white/5 rounded-xl active:scale-[0.98]"
                    onClick={onClose}
                >
                    See all models in settings →
                </button>
            </div>
        </div>
    );
};
