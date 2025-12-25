import React from 'react';

interface SkeletonMessageProps {
    thinkingText?: string;
}

/**
 * Premium skeleton loader for AI "thinking" state
 * Shows shimmer lines with staggered animation - ChatGPT-level polish
 */
export const SkeletonMessage: React.FC<SkeletonMessageProps> = ({
    thinkingText = "KroniQ is thinking…"
}) => {
    return (
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-gray-800/50 backdrop-blur-sm max-w-[85%]">
            {/* Thinking text with pulse */}
            <div className="flex items-center gap-2 text-white/60 text-sm">
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>{thinkingText}</span>
            </div>

            {/* Skeleton lines with shimmer effect */}
            <div className="flex flex-col gap-2">
                <div className="skeleton-line" style={{ width: '90%' }} />
                <div className="skeleton-line" style={{ width: '75%', animationDelay: '0.15s' }} />
                <div className="skeleton-line" style={{ width: '60%', animationDelay: '0.3s' }} />
            </div>
        </div>
    );
};
